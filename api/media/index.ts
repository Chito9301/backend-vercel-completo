import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, sendJSON } from "../_utils";
import { dbConnect } from "../../lib/db";
import Media from "../../models/Media";
import { requireAuth } from "../_authGuard";
import { cloudinary } from "../../lib/cloudinary";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await dbConnect();
  if (req.method === "GET") {
    const items = await Media.find().sort({ createdAt: -1 }).lean();
    return sendJSON(res, 200, { items });
  }
  if (req.method === "POST") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const form = formidable({ multiples: false, keepExtensions: true, maxFileSize: 1024 * 1024 * 25 }); // 25MB
    form.parse(req, async (err, fields, files) => {
      if (err) return sendJSON(res, 400, { error: "Formulario inválido" });

      const preset = (fields.upload_preset as string) || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      const resource_type = (fields.resource_type as string) || "auto"; // image, video, raw

      // Caso 1: archivo subido (multipart)
      const file = (files.file || files.upload || files.image || files.media) as any;
      if (file) {
        try {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "media", upload_preset: preset || undefined, resource_type },
            async (error, result) => {
              if (error || !result) return sendJSON(res, 500, { error: error?.message || "Fallo de subida" });
              const doc = await Media.create({
                url: result.secure_url,
                publicId: result.public_id,
                resourceType: result.resource_type,
                format: result.format,
                bytes: result.bytes,
                createdBy: auth.userId
              });
              return sendJSON(res, 201, { item: doc, upload: result });
            }
          );
          const fs = await import("fs");
          fs.createReadStream(file.filepath).pipe(stream);
        } catch (e:any) {
          return sendJSON(res, 500, { error: e.message || "Error de subida" });
        }
        return;
      }

      // Caso 2: subir por URL remota
      const url = fields.url as string | undefined;
      if (url) {
        try {
          const result = await cloudinary.uploader.upload(url, { folder: "media", upload_preset: preset || undefined, resource_type });
          const doc = await Media.create({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            bytes: result.bytes,
            createdBy: auth.userId
          });
          return sendJSON(res, 201, { item: doc, upload: result });
        } catch (e:any) {
          return sendJSON(res, 500, { error: e.message || "Error al subir desde URL" });
        }
      }

      // Caso 3: dataURL/base64 en campo "dataUrl"
      const dataUrl = fields.dataUrl as string | undefined;
      if (dataUrl?.startsWith("data:")) {
        try {
          const base64 = dataUrl.split(",")[1];
          const buffer = Buffer.from(base64, "base64");
          const stream = cloudinary.uploader.upload_stream(
            { folder: "media", upload_preset: preset || undefined, resource_type },
            async (error, result) => {
              if (error || !result) return sendJSON(res, 500, { error: error?.message || "Fallo de subida" });
              const doc = await Media.create({
                url: result.secure_url,
                publicId: result.public_id,
                resourceType: result.resource_type,
                format: result.format,
                bytes: result.bytes,
                createdBy: auth.userId
              });
              return sendJSON(res, 201, { item: doc, upload: result });
            }
          );
          const { Readable } = await import("stream");
          Readable.from(buffer).pipe(stream);
        } catch (e:any) {
          return sendJSON(res, 500, { error: e.message || "Error al subir base64" });
        }
        return;
      }

      return sendJSON(res, 400, { error: "Provee 'file' multipart, 'url' o 'dataUrl'" });
    });
    return;
  }
  return methodGuard(req, res, ["GET","POST"]);
}
