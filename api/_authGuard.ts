import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTokenFromHeaders, verifyJwt } from "../lib/jwt";

export function requireAuth<T extends VercelRequest>(
  req: T, res: VercelResponse
): { userId: string } | null {
  const token = getTokenFromHeaders(req.headers);
  if (!token) {
    res.status(401).json({ error: "No autenticado" });
    return null;
  }
  try {
    const payload = verifyJwt(token);
    return { userId: payload.sub };
  } catch {
    res.status(401).json({ error: "Token inválido" });
    return null;
  }
}
