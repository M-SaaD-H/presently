import mongoose, { type ConnectOptions } from "mongoose";
import dns from "node:dns";

// Mongo doesn't support ipv6 tcp connections and standalone
// node process running on node 17+ uses ipv6 by default
// So we prefer ipv4 DNS lookups across all environments
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && cached.conn.connection?.readyState === 1) {
    return cached.conn;
  }

  if (cached.conn && cached.conn.connection?.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts: ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 5,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 0,
      family: 4, // forces mongo driver to req ipv4 addresses
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export { connectDB };
