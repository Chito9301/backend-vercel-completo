import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, sendJSON } from "../_utils";
import { dbConnect } from "../../lib/db";
import User from "../../models/User";
import { signJwt } from "../../lib/jwt";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["POST"])) return;
  await dbConnect();
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) return sendJSON(res, 400, { error: "username, email y password son requeridos" });
  try {
    const existing = await User.findOne({ email });
    if (existing) return sendJSON(res, 409, { error: "Email ya registrado" });
    const user = new User({ username, email, password });
    await user.save();
    const token = signJwt({ sub: (user as any)._id.toString(), email: user.email });
    return sendJSON(res, 201, { user: { id: (user as any)._id, username: user.username, email: user.email }, token });
  } catch (e:any) {
    return sendJSON(res, 500, { error: e.message || "Error interno" });
  }
}
