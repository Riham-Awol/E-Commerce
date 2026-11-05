import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { z } from "zod";
import { pool } from "../config/db";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import {
  signAccessToken, signRefreshToken, verifyRefreshToken, type TokenPayload,
} from "../utils/tokens";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  reward_points: number;
}

// In production the storefront and API usually live on different domains
// (e.g. Vercel + Render), so the refresh cookie must be cross-site.
const refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: (env.isProd ? "none" : "lax") as "none" | "lax",
};

function issueTokens(res: Response, payload: TokenPayload) {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res.cookie("refresh_token", refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return { accessToken, refreshToken };
}

async function persistRefreshToken(userId: number, token: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (:userId, :token, :expires)",
    { userId, token, expires },
  );
}

export async function register(req: Request, res: Response) {
  const { name, email, password, phone } = req.body as z.infer<typeof registerSchema>;

  const [existing] = await pool.query<UserRow[]>("SELECT id FROM users WHERE email = :email", { email });
  if (existing.length) throw ApiError.conflict("Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (name, email, password_hash, phone, role) VALUES (:name, :email, :hash, :phone, 'customer')",
    { name, email, hash: passwordHash, phone: phone ?? null },
  );

  const payload: TokenPayload = { sub: result.insertId, email, role: "customer" };
  const { accessToken, refreshToken } = issueTokens(res, payload);
  await persistRefreshToken(result.insertId, refreshToken);

  res.status(201).json({
    success: true,
    accessToken,
    user: { id: result.insertId, name, email, role: "customer" },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const [rows] = await pool.query<UserRow[]>("SELECT * FROM users WHERE email = :email", { email });
  const user = rows[0];
  if (!user || !user.password_hash) throw ApiError.unauthorized("Invalid credentials");

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw ApiError.unauthorized("Invalid credentials");

  const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role };
  const { accessToken, refreshToken } = issueTokens(res, payload);
  await persistRefreshToken(user.id, refreshToken);

  res.json({
    success: true,
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, rewardPoints: user.reward_points },
  });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refresh_token as string | undefined;
  if (!token) throw ApiError.unauthorized("Missing refresh token");

  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM refresh_tokens WHERE token = :token AND expires_at > NOW()",
    { token },
  );
  if (!rows.length) throw ApiError.unauthorized("Refresh token revoked");

  const accessToken = signAccessToken({ sub: payload.sub, email: payload.email, role: payload.role });
  res.json({ success: true, accessToken });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.refresh_token as string | undefined;
  if (token) await pool.query("DELETE FROM refresh_tokens WHERE token = :token", { token });
  res.clearCookie("refresh_token", refreshCookieOptions);
  res.json({ success: true });
}

export async function me(req: Request, res: Response) {
  const [rows] = await pool.query<UserRow[]>(
    "SELECT id, name, email, role, reward_points, credit_limit FROM users WHERE id = :id",
    { id: req.user!.sub },
  );
  if (!rows.length) throw ApiError.notFound("User not found");
  res.json({ success: true, user: rows[0] });
}
