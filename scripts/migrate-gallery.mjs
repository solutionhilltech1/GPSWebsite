// One-off: move public/gallery/* + src/data/gallery-content.json into UploadThing + MongoDB.
// Run: node --env-file=.env.local scripts/migrate-gallery.mjs   (safe to re-run; skips names already migrated)
import fs from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";
import { UTApi, UTFile } from "uploadthing/server";

const dir = path.join("public", "gallery");
const meta = JSON.parse(fs.readFileSync(path.join("src", "data", "gallery-content.json"), "utf8"));
const client = await new MongoClient(process.env.MONGODB_URI).connect();
const photos = client.db(process.env.MONGODB_DB).collection("gallery");
const utapi = new UTApi();

for (const name of fs.readdirSync(dir)) {
  if (await photos.findOne({ name })) {
    console.log("skip", name);
    continue;
  }
  const res = await utapi.uploadFiles(new UTFile([fs.readFileSync(path.join(dir, name))], name));
  if (res.error) throw new Error(`${name}: ${res.error.message}`);

  const m = meta[name] ?? {};
  const date = new Date(m.updatedAt ?? fs.statSync(path.join(dir, name)).mtimeMs);
  await photos.insertOne({
    key: res.data.key,
    url: res.data.ufsUrl,
    name,
    size: res.data.size,
    title: m.title ?? name.replace(/\.[^.]+$/, ""),
    caption: m.caption ?? "",
    category: m.category ?? "General",
    tags: m.tags ?? [],
    createdAt: date,
    updatedAt: date,
  });
  console.log("migrated", name);
}
await client.close();
process.exit(0); // UTApi keeps the event loop alive
