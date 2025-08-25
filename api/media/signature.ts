import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, sendJSON } from "../_utils";
import { requireAuth } from "../_authGuard";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

// Genera firma para upload directo desde el cliente (recomendado para archivos grandes)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["POST"])) return;
  const auth = requireAuth(req, res);
  if (!auth) return;
  const timestamp = Math.floor(Date.now() / 1000);
  const upload_preset = (req.body && (req.body.upload_preset as string)) || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const paramsToSign = { timestamp, upload_preset };
  const apiSecret = process.env.CLOUDINARY_API_SECRET as string;
  if (!apiSecret) return sendJSON(res, 500, { error: "Falta CLOUDINARY_API_SECRET" });
  const sig = cloudinary.utils.api_sign_request(paramsToSign as any, apiSecret);
  return sendJSON(res, 200, {
    timestamp,
    upload_preset,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    signature: sig
  });
}
