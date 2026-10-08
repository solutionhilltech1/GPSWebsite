import { MongoClient } from "mongodb";

const g = globalThis as { _mongo?: Promise<MongoClient> };

// Reuse one connection across requests and dev hot reloads; retry if the first connect failed.
export async function db() {
  g._mongo ??= new MongoClient(process.env.MONGODB_URI!).connect().catch((err) => {
    g._mongo = undefined;
    throw err;
  });
  return (await g._mongo).db(process.env.MONGODB_DB);
}
