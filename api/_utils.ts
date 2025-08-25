import type { VercelRequest, VercelResponse } from "@vercel/node";

export function sendJSON(res: VercelResponse, status: number, data: any) {
  res.status(status).json(data);
}

export function methodGuard(req: VercelRequest, res: VercelResponse, allowed: string[]) {
  const method = req.method || "";
  if (!allowed.includes(method)) {
    res.setHeader("Allow", allowed);
    res.status(405).json({ error: "Method Not Allowed" });
    return false;
  }
  return true;
}
