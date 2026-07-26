import type { Order } from "@/types";

export const demoOrders: Order[] = [
  {
    id: "1",
    reference: "BVS-482910",
    date: "2026-07-24",
    status: "out_for_delivery",
    items: [
      { name: "Classic Cola 330ml Can", qty: 48, price: 0.5 },
      { name: "Alpine Spring Water 500ml", qty: 72, price: 0.32 },
    ],
    subtotal: 47.04,
    tax: 3.76,
    deliveryFee: 0,
    total: 50.8,
    paymentMethod: "Card (Stripe)",
    deliveryAddress: "14 Market Street, Harbor City",
    estimatedDelivery: "Today, 2:00–5:00pm",
  },
  {
    id: "2",
    reference: "BVS-482755",
    date: "2026-07-20",
    status: "delivered",
    items: [{ name: "Golden Lager 330ml", qty: 96, price: 0.79 }],
    subtotal: 75.84,
    tax: 6.07,
    deliveryFee: 12.5,
    total: 94.41,
    paymentMethod: "Bank Transfer",
    deliveryAddress: "14 Market Street, Harbor City",
    estimatedDelivery: "Delivered 2026-07-21",
  },
  {
    id: "3",
    reference: "BVS-481022",
    date: "2026-07-12",
    status: "delivered",
    items: [
      { name: "Reserve Red Wine 750ml", qty: 12, price: 5.8 },
      { name: "Highland Malt Whisky 700ml", qty: 6, price: 17.58 },
    ],
    subtotal: 175.08,
    tax: 14.01,
    deliveryFee: 0,
    total: 189.09,
    paymentMethod: "Card (Stripe)",
    deliveryAddress: "Sunrise Hotel, Bay Avenue",
    estimatedDelivery: "Delivered 2026-07-13",
  },
];

export const orderStatusSteps: { key: string; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "ready_for_dispatch", label: "Ready for Dispatch" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];
