import { ObjectId, type WithId } from "mongodb";
import { revalidateTag } from "next/cache";
import { UTApi } from "uploadthing/server";
import { isAdmin } from "@/lib/auth";
import { CURRENT, PROJECTS_TAG, imageKeys, parseProject, projectsCollection, type AdminProject, type ParsedProject, type ProjectDoc } from "@/lib/projects";

const utapi = new UTApi();
const unauthorized = () => Response.json({ error: "Please log in again." }, { status: 401 });
const badRequest = (error: string) => Response.json({ error }, { status: 400 });
const notFound = () => Response.json({ error: "Project not found." }, { status: 404 });
const objectId = (id: unknown) => (typeof id === "string" && ObjectId.isValid(id) ? new ObjectId(id) : null);

// expire: 0 so the very next visit renders the change instead of serving the stale copy once.
const published = () => revalidateTag(PROJECTS_TAG, { expire: 0 });

const toAdmin = ({ _id, ...d }: WithId<ProjectDoc>): AdminProject => ({ ...d, id: _id.toString() });

// Split parsed fields into $set / $unset: Mongo would store an absent cover or RERA as null.
function fields(p: ParsedProject) {
  const { image, rera, ...rest } = p;
  return {
    set: { ...rest, ...(image && { image }), ...(rera && { rera }) },
    unset: { ...(!image && { image: "" as const }), ...(!rera && { rera: "" as const }) },
  };
}

const slugTaken = async (slug: string) =>
  Boolean(await (await projectsCollection()).findOne({ slug }, { projection: { _id: 1 } }));

// "nirmal-kutia", then "nirmal-kutia-2", "-3"… if two projects share a name.
async function freeSlug(base: string) {
  let slug = base;
  for (let n = 2; await slugTaken(slug); n++) slug = `${base}-${n}`;
  return slug;
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  const docs = await (await projectsCollection()).find(CURRENT).sort({ order: 1, createdAt: 1 }).toArray();
  return Response.json({ success: true, projects: docs.map(toAdmin) });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const parsed = parseProject(await request.json().catch(() => ({})));
  if ("error" in parsed) return badRequest(parsed.error);
  const now = new Date();
  const { set } = fields({ ...parsed.project, slug: await freeSlug(parsed.project.slug) });
  const { insertedId } = await (await projectsCollection()).insertOne({ ...set, createdAt: now, updatedAt: now });
  published();
  return Response.json({ success: true, id: insertedId.toString() });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await request.json().catch(() => ({}));
  const _id = objectId(body.id);
  if (!_id) return badRequest("Missing project id.");
  const parsed = parseProject(body);
  if ("error" in parsed) return badRequest(parsed.error);

  const collection = await projectsCollection();
  const existing = await collection.findOne({ _id, ...CURRENT });
  if (!existing) return notFound();
  // The page address never changes after creation, so shared links keep working after a rename.
  const { set, unset } = fields({ ...parsed.project, slug: existing.slug });
  await collection.updateOne({ _id }, { $set: { ...set, updatedAt: new Date() }, ...(Object.keys(unset).length && { $unset: unset }) });
  published();

  // Delete files the project no longer uses, only after the record stops pointing at them.
  const kept = new Set(imageKeys(parsed.project));
  const dropped = imageKeys(existing).filter((k) => !kept.has(k));
  if (dropped.length) await utapi.deleteFiles(dropped);
  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const _id = objectId(new URL(request.url).searchParams.get("id"));
  if (!_id) return badRequest("Missing project id.");

  const doc = await (await projectsCollection()).findOneAndDelete({ _id, ...CURRENT });
  if (!doc) return notFound();
  published();
  const keys = imageKeys(doc);
  if (keys.length) await utapi.deleteFiles(keys);
  return Response.json({ success: true });
}
