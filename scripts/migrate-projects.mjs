// One-off: copy projects from src/data/site.ts into MongoDB, re-hosting their photos on UploadThing.
// Run: node --env-file=.env.local scripts/migrate-projects.mjs   (safe to re-run; skips slugs already migrated)
import { MongoClient } from "mongodb";
import { UTApi } from "uploadthing/server";
import { projects } from "../src/data/site.ts";

const client = await new MongoClient(process.env.MONGODB_URI).connect();
const col = client.db(process.env.MONGODB_DB).collection("projects");
const utapi = new UTApi();

// Same Unsplash photo is reused across projects; upload it once.
const hosted = new Map();
const host = async (url, name) => {
  if (!hosted.has(url)) {
    const res = await utapi.uploadFilesFromUrl({ url, name });
    if (res.error) throw new Error(`${name}: ${res.error.message}`);
    hosted.set(url, { key: res.data.key, url: res.data.ufsUrl });
  }
  return hosted.get(url);
};

for (const [order, p] of projects.entries()) {
  if (await col.findOne({ slug: p.slug })) {
    console.log("skip", p.slug);
    continue;
  }
  const cover = await host(p.image, `${p.slug}-cover.jpg`);
  const gallery = [];
  for (const [i, url] of p.gallery.entries()) gallery.push(await host(url, `${p.slug}-${i + 1}.jpg`));

  const now = new Date();
  await col.insertOne({
    ...p,
    order,
    image: cover.url,
    gallery: gallery.map((g) => g.url),
    keys: [cover.key, ...gallery.map((g) => g.key)],
    createdAt: now,
    updatedAt: now,
  });
  console.log("migrated", p.slug);
}
await col.createIndex({ slug: 1 }, { unique: true });
await client.close();
process.exit(0); // UTApi keeps the event loop alive
