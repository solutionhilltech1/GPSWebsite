// Seeds the `projects` collection and uploads their photos to UploadThing.
//
//   node --env-file=.env.local scripts/seed-projects.mjs <folder-with-photos>
//
// Safe to re-run: a project is only inserted if its slug is new, and a photo is only uploaded
// into an empty slot (no cover yet / empty gallery). Edits made in /admin/projects are never touched.
// Photos are matched by the file names below; missing files are skipped and reported.
import { readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { MongoClient } from "mongodb";
import { UTApi, UTFile } from "uploadthing/server";

const dir = process.argv[2];
if (!dir) throw new Error("Usage: node --env-file=.env.local scripts/seed-projects.mjs <folder-with-photos>");

// Client projects (Oct 2026). TODO(client): confirm statuses and send missing details.
const seed = [
  {
    order: 1,
    cover: "aipl-legacy-42-lobby.jpg",
    gallery: ["aipl-legacy-42-lobby.jpg", "aipl-legacy-42-day.jpg"],
    project: {
      slug: "aipl-legacy-42",
      name: "AIPL Legacy 42",
      category: "Commercial",
      status: "Completed",
      location: "Okhla Phase III, Okhla Industrial Estate, New Delhi 110020",
      tagline: "LEED Gold offices in Okhla",
      description:
        "A glass-and-stone commercial building in Okhla Industrial Estate, New Delhi, with a double-height glazed lobby, curved terraces stacked up its corner and a landscaped forecourt. Certified LEED Gold by the U.S. Green Building Council.",
      facts: [
        { label: "Type", value: "Commercial" },
        { label: "Certification", value: "LEED Gold" },
        { label: "City", value: "New Delhi" },
      ],
      highlights: [
        "LEED Gold certified (USGBC)",
        "Full-height glass façade",
        "Double-height glazed lobby",
        "Curved corner terraces",
        "Landscaped forecourt",
      ],
    },
  },
  {
    order: 2,
    cover: "nirmal-ashram-hospital.jpg",
    gallery: [],
    project: {
      slug: "nirmal-ashram-hospital",
      name: "Nirmal Ashram Hospital",
      category: "Healthcare",
      status: "Completed",
      location: "Mayakund, Rishikesh, Uttarakhand",
      tagline: "Care at the foot of the hills",
      description:
        "A multi-storey hospital in Mayakund, Rishikesh: two connected blocks with a 24×7 emergency wing at street level and ward floors rising above, set against the Himalayan foothills.",
      facts: [
        { label: "Type", value: "Healthcare" },
        { label: "Blocks", value: "2" },
        { label: "City", value: "Rishikesh" },
      ],
      highlights: ["24×7 emergency wing", "Multi-storey ward blocks", "Street-front patient access"],
    },
  },
  {
    order: 3,
    cover: "nirmal-kutia-ludhiana.jpg",
    gallery: [],
    project: {
      slug: "nirmal-kutia-ludhiana",
      name: "Nirmal Kutia, Sihan Daud",
      category: "Religious",
      status: "Ongoing",
      location: "Sihan Daud, Maler, Ludhiana, Punjab",
      tagline: "Rose-pink arches and parapets",
      description:
        "A two-storey complex around a planted courtyard, with scalloped arches framing every upper window, battlement-style parapets along the roofline and a tall, open ground-floor hall.",
      facts: [
        { label: "Type", value: "Religious" },
        { label: "Storeys", value: "2" },
        { label: "District", value: "Ludhiana" },
      ],
      highlights: ["Scalloped arch window surrounds", "Battlement-style parapets", "Double-height ground-floor hall", "Planted courtyard"],
    },
  },
  {
    order: 4,
    cover: "nirmal-kutia-nabha-elevation.jpg",
    gallery: ["nirmal-kutia-nabha-plan.jpg", "nirmal-kutia-nabha-elevation.jpg"],
    project: {
      slug: "nirmal-kutia-nabha",
      name: "Nirmal Kutia, Bhorey",
      category: "Religious",
      status: "Upcoming",
      location: "Bhorey, Nabha, Patiala, Punjab",
      tagline: "White marble and gold under three domes",
      description:
        "A gurdwara in white and gold: a central lotus dome with a gold kalash, flanked by two domed chhatris, raised on a marble verandah in a landscaped, paved compound. Inside, the darbar hall carries a Khanda floor inlay, with a Guru Nishan Ghar at each front corner.",
      facts: [
        { label: "Type", value: "Religious" },
        { label: "Domes", value: "3" },
        { label: "District", value: "Patiala" },
      ],
      highlights: [
        "Central dome with gold kalash",
        "Twin domed chhatris",
        "Two Guru Nishan Ghar",
        "Khanda floor inlay in the darbar hall",
        "Marble verandah",
        "Landscaped, paved compound",
      ],
    },
  },
];

const mime = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const utapi = new UTApi();
const missing = [];
const uploadedByName = new Map(); // a file used as cover and in the gallery is uploaded once

async function upload(name) {
  if (uploadedByName.has(name)) return uploadedByName.get(name);
  let bytes;
  try {
    bytes = await readFile(join(dir, name));
  } catch {
    missing.push(name);
    return null;
  }
  const res = await utapi.uploadFiles(new UTFile([bytes], basename(name), { type: mime[extname(name).toLowerCase()] }));
  if (res.error) throw new Error(`Upload failed for ${name}: ${res.error.message}`);
  const image = { key: res.data.key, url: res.data.ufsUrl };
  uploadedByName.set(name, image);
  console.log(`  uploaded ${name} -> ${image.url}`);
  return image;
}

const client = await new MongoClient(process.env.MONGODB_URI).connect();
try {
  const projects = client.db(process.env.MONGODB_DB).collection("projects");
  await projects.createIndex({ slug: 1 }, { unique: true });

  for (const { order, cover, gallery, project } of seed) {
    const now = new Date();
    const { upsertedCount } = await projects.updateOne(
      { slug: project.slug },
      { $setOnInsert: { ...project, order, gallery: [], createdAt: now, updatedAt: now } },
      { upsert: true },
    );
    console.log(`${project.slug}: ${upsertedCount ? "created" : "already exists"}`);

    const doc = await projects.findOne({ slug: project.slug });
    const set = {};
    if (!doc.image) {
      const image = await upload(cover);
      if (image) set.image = image;
    }
    if (!doc.gallery.length && gallery.length) {
      const images = (await Promise.all(gallery.map(upload))).filter(Boolean);
      if (images.length) set.gallery = images;
    }
    if (Object.keys(set).length) await projects.updateOne({ _id: doc._id }, { $set: { ...set, updatedAt: new Date() } });
  }
} finally {
  await client.close();
}

if (missing.length) {
  console.log(`\nNot found in ${dir} (add them and re-run, or upload in /admin/projects):`);
  for (const m of new Set(missing)) console.log(`  ${m}`);
}
console.log("\nDone. Note: a running site keeps its cached project list until an admin edit or a redeploy.");
