import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, sendJSON } from "../_utils";
import { dbConnect } from "../../lib/db";
import User from "../../models/User";
import { signJwt } from "../../lib/jwt";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["POST"])) return;
  await dbConnect();
  const { email, password } = req.body || {};
  if (!email || !password) return sendJSON(res, 400, { error: "email y password son requeridos" });
  try {
    const user = await User.findOne({ email });
    if (!user) return sendJSON(res, 401, { error: "Credenciales inválidas" });
    const ok = await (user as any).comparePassword(password);
    if (!ok) return sendJSON(res, 401, { error: "Credenciales inválidas" });
    const token = signJwt({ sub: (user as any)._id.toString(), email: user.email });
    return sendJSON(res, 200, { user: { id: (user as any)._id, username: (user as any).username, email: user.email }, token });
  } catch (e:any) {
    return sendJSON(res, 500, { error: e.message || "Error interno" });
  }
}
