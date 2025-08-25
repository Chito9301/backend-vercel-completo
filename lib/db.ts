import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI");
}

interface GlobalWithMongoose {
  mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const globalAny = global as unknown as GlobalWithMongoose;

if (!globalAny.mongoose) {
  globalAny.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (globalAny.mongoose.conn) return globalAny.mongoose.conn;
  if (!globalAny.mongoose.promise) {
    globalAny.mongoose.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || undefined
    });
  }
  globalAny.mongoose.conn = await globalAny.mongoose.promise;
  return globalAny.mongoose.conn;
}
