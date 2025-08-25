import jwt from "jsonwebtoken";
import type { IncomingHttpHeaders } from "http";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET");
}

export interface JwtPayloadCustom {
  sub: string;
  email?: string;
}

export function signJwt(payload: JwtPayloadCustom, expiresIn: string = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt(token: string): JwtPayloadCustom {
  return jwt.verify(token, JWT_SECRET) as JwtPayloadCustom;
}

export function getTokenFromHeaders(headers: IncomingHttpHeaders) {
  const raw = (headers as any).authorization || (headers as any).Authorization;
  if (!raw || typeof raw !== "string") return null;
  const [scheme, token] = raw.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}
