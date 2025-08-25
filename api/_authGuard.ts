import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getBearer, verifyJwt } from "../lib/jwt";

export function requireAuth(req: VercelRequest, res: VercelResponse) {
  const token = getBearer(req.headers);
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
