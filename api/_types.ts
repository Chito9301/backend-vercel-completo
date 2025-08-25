import type { VercelRequest, VercelResponse } from "@vercel/node";
export type Handler = (req: VercelRequest, res: VercelResponse) => void | Promise<void>;
