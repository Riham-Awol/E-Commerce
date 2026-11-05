import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import Stripe from "stripe";
import { z } from "zod";
import { pool } from "../config/db";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

/**
 * Card payments via Stripe Checkout (Stripe's hosted payment page), so card
 * details never touch this server.
 *
 * Flow: the customer places an order (payment_status = pending), then
 * POST /payments/checkout-session returns a Stripe URL to redirect to. After
 * paying, Stripe sends them back to /checkout/success, which calls
 * POST /payments/confirm. The webhook does the same server-to-server, so the
 * order is marked paid even if the customer closes the tab. Sessions expire
 * after 30 minutes; on expiry the unpaid order is cancelled and stock restored.
 */

function createStripeClient(): Stripe | null {
  if (!env.stripe.secretKey) return null;
  const config: Stripe.StripeConfig = { maxNetworkRetries: 2, timeout: 20_000 };
  if (env.stripe.apiBase) {
    const u = new URL(env.stripe.apiBase);
    config.host = u.hostname;
    config.port = Number(u.port || (u.protocol === "https:" ? 443 : 80));
    config.protocol = u.protocol.replace(":", "") as "http" | "https";
  }
  return new Stripe(env.stripe.secretKey, config);
}

const stripe = createStripeClient();

function requireStripe(): Stripe {
  if (!stripe) throw new ApiError(503, "Card payments are not configured.");
  return stripe;
}

const toCents = (amount: number) => Math.round(Number(amount) * 100);

interface OrderRow extends RowDataPacket {
  id: number;
  reference: string;
  user_id: number;
  status: string;
  payment_status: string;
  total: number;
  stripe_session_id: string | null;
}

async function findOrder(reference: string): Promise<OrderRow | undefined> {
  const [rows] = await pool.query<OrderRow[]>("SELECT * FROM orders WHERE reference = :reference", { reference });
  return rows[0];
}

/** GET /api/payments/config — whether card payments are available. */
export async function paymentConfig(_req: Request, res: Response) {
  res.json({ success: true, card: Boolean(stripe) });
}

export const checkoutSessionSchema = z.object({ reference: z.string().min(1) });

/** POST /api/payments/checkout-session — start (or restart) card payment for an order. */
export async function createCheckoutSession(req: Request, res: Response) {
  const client = requireStripe();
  const { reference } = req.body as z.infer<typeof checkoutSessionSchema>;

  const order = await findOrder(reference);
  if (!order || order.user_id !== req.user!.sub) throw ApiError.notFound("Order not found");
  if (order.payment_status === "paid") throw ApiError.conflict("This order is already paid.");
  if (order.status === "cancelled") throw ApiError.conflict("This order was cancelled. Please place a new order.");
  const amount = toCents(order.total);
  if (amount < 50) throw ApiError.badRequest("Card payments need an order total of at least 0.50.");

  const [items] = await pool.query<RowDataPacket[]>(
    "SELECT product_name, quantity FROM order_items WHERE order_id = :id",
    { id: order.id },
  );
  const summary = items.map((i) => `${i.quantity} × ${i.product_name}`).join(", ");

  const origin = env.siteUrl || req.get("origin") || env.clientOrigins[0];
  const ref = encodeURIComponent(order.reference);

  let session: Stripe.Checkout.Session;
  try {
    session = await client.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: env.stripe.currency,
            unit_amount: amount,
            product_data: {
              name: `BevSupply order ${order.reference}`,
              description: summary.length > 480 ? `${summary.slice(0, 477)}…` : summary || undefined,
            },
          },
        },
      ],
      customer_email: req.user!.email,
      client_reference_id: order.reference,
      metadata: { reference: order.reference, orderId: String(order.id) },
      payment_intent_data: { metadata: { reference: order.reference } },
      success_url: `${origin}/checkout/success?ref=${ref}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancelled?ref=${ref}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });
  } catch (err) {
    console.error(`Stripe checkout session failed for ${order.reference}:`, (err as Error).message);
    throw new ApiError(502, "Card payment couldn't be started right now. Please try again or choose another payment method.");
  }

  // Point the order at the new session first, then expire any older session so
  // it can't be paid as well (its expiry webhook is ignored: id no longer matches).
  await pool.query("UPDATE orders SET stripe_session_id = :sid WHERE id = :id", { sid: session.id, id: order.id });
  if (order.stripe_session_id && order.stripe_session_id !== session.id) {
    await client.checkout.sessions.expire(order.stripe_session_id).catch(() => undefined);
  }

  res.json({ success: true, url: session.url });
}

/** Mark the order paid if Stripe says the session is paid in full. Idempotent. */
async function markPaid(session: Stripe.Checkout.Session): Promise<boolean> {
  if (session.payment_status !== "paid") return false;
  const reference = session.metadata?.reference ?? session.client_reference_id;
  if (!reference) return false;
  const order = await findOrder(reference);
  if (!order) return false;
  if (order.payment_status === "paid") return true;
  if (session.amount_total !== toCents(order.total)) {
    console.error(`Stripe amount mismatch for ${reference}: ${session.amount_total} vs ${toCents(order.total)}`);
    return false;
  }
  await pool.query(
    `UPDATE orders
       SET payment_status = 'paid', paid_at = NOW(), stripe_session_id = :sid,
           status = IF(status = 'pending', 'confirmed', status)
     WHERE id = :id AND payment_status <> 'paid'`,
    { sid: session.id, id: order.id },
  );
  await pool.query(
    "INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata) VALUES (:userId, 'order.paid', 'order', :orderId, :meta)",
    { userId: order.user_id, orderId: String(order.id), meta: JSON.stringify({ stripeSession: session.id }) },
  );
  return true;
}

/** An unpaid Checkout session expired: cancel the order and put the stock back. */
async function cancelExpired(session: Stripe.Checkout.Session): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query<OrderRow[]>(
      `SELECT * FROM orders
        WHERE stripe_session_id = :sid AND payment_status = 'pending' AND status = 'pending'
        FOR UPDATE`,
      { sid: session.id },
    );
    const order = rows[0];
    if (!order) {
      await conn.rollback();
      return;
    }
    const [items] = await conn.query<RowDataPacket[]>(
      "SELECT product_id, quantity FROM order_items WHERE order_id = :id AND product_id IS NOT NULL",
      { id: order.id },
    );
    for (const item of items) {
      await conn.query("UPDATE products SET stock = stock + :qty WHERE id = :pid", {
        qty: item.quantity, pid: item.product_id,
      });
    }
    await conn.query("UPDATE orders SET status = 'cancelled' WHERE id = :id", { id: order.id });
    await conn.query(
      "INSERT INTO audit_logs (user_id, action, entity, entity_id) VALUES (:userId, 'order.payment_expired', 'order', :orderId)",
      { userId: order.user_id, orderId: String(order.id) },
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export const confirmSchema = z.object({ sessionId: z.string().min(1) });

/** POST /api/payments/confirm — called by the success page right after Stripe redirects back. */
export async function confirmPayment(req: Request, res: Response) {
  const client = requireStripe();
  const { sessionId } = req.body as z.infer<typeof confirmSchema>;

  let session: Stripe.Checkout.Session;
  try {
    session = await client.checkout.sessions.retrieve(sessionId);
  } catch {
    throw ApiError.notFound("Payment session not found");
  }
  const reference = session.metadata?.reference ?? session.client_reference_id ?? "";
  const order = await findOrder(reference);
  if (!order || order.user_id !== req.user!.sub) throw ApiError.notFound("Order not found");

  const paid = await markPaid(session);
  const updated = await findOrder(reference);
  res.json({
    success: true,
    reference,
    paid: paid || updated?.payment_status === "paid",
    total: Number(updated?.total ?? order.total),
  });
}

/** POST /api/payments/webhook — Stripe → server notifications (raw body, signed). */
export async function stripeWebhook(req: Request, res: Response) {
  const client = requireStripe();
  if (!env.stripe.webhookSecret) throw new ApiError(503, "Stripe webhook secret is not configured.");

  let event: Stripe.Event;
  try {
    event = client.webhooks.constructEvent(req.body as Buffer, req.get("stripe-signature") ?? "", env.stripe.webhookSecret);
  } catch (err) {
    throw ApiError.badRequest(`Webhook signature verification failed: ${(err as Error).message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await markPaid(event.data.object);
      break;
    case "checkout.session.expired":
      await cancelExpired(event.data.object);
      break;
    default:
      break;
  }
  res.json({ received: true });
}
