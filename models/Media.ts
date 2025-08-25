import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const MediaSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  resourceType: { type: String }, // image, video, raw (audio entra como raw en Cloudinary)
  format: { type: String },
  bytes: { type: Number },
  createdBy: { type: Types.ObjectId, ref: "User" }
}, { timestamps: true });

export type MediaDoc = InferSchemaType<typeof MediaSchema>;

export default mongoose.models.Media || mongoose.model<MediaDoc>("Media", MediaSchema);
