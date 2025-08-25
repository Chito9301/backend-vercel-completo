import jwt from "jsonwebtoken";
import type { IncomingHttpHeaders } from "http";

const SECRET = process.env.JWT_SECRET as string;
if (!SECRET) throw new Error("Missing JWT_SECRET");

export interface JwtPayload {
  sub: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export function signJwt(payload: Omit<JwtPayload, "iat" | "exp">, expiresIn = "7d") {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}

export function getBearer(headers: IncomingHttpHeaders) {
  const raw = (headers.authorization || (headers as any).Authorization) as string | undefined;
  if (!raw) return null;
  const [scheme, token] = raw.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}
