import { createRouteHandler, createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { ADMIN_COOKIE, validSession } from "@/lib/auth";

const f = createUploadthing();

// Read the cookie off `req`, not cookies(): this runs inside UploadThing's Effect runtime.
const adminOnly = async ({ req }: { req: Request & { cookies: { get(name: string): { value: string } | undefined } } }) => {
  if (!(await validSession(req.cookies.get(ADMIN_COOKIE)?.value))) throw new UploadThingError({ code: "FORBIDDEN", message: "Please log in again." });
  return {};
};

// Browsers upload straight to UploadThing; this only signs uploads for a logged-in admin.
// The admin pages then save the returned keys through /api/admin/gallery or /api/admin/projects.
const router = {
  galleryImage: f({ image: { maxFileSize: "16MB", maxFileCount: 20 } }).middleware(adminOnly).onUploadComplete(() => {}),
  projectImage: f({ image: { maxFileSize: "16MB", maxFileCount: 20 } }).middleware(adminOnly).onUploadComplete(() => {}),
} satisfies FileRouter;

export type GalleryRouter = typeof router;

export const { GET, POST } = createRouteHandler({ router });
