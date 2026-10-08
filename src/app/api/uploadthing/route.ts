import { createRouteHandler, createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { ADMIN_COOKIE, validSession } from "@/lib/auth";

const f = createUploadthing();

// Browsers upload straight to UploadThing; this only signs uploads for a logged-in admin.
// The admin page then saves the returned keys + captions through /api/admin/gallery.
const router = {
  galleryImage: f({ image: { maxFileSize: "16MB", maxFileCount: 20 } })
    // Read the cookie off `req`, not cookies(): this runs inside UploadThing's Effect runtime.
    .middleware(({ req }) => {
      if (!validSession(req.cookies.get(ADMIN_COOKIE)?.value)) throw new UploadThingError({ code: "FORBIDDEN", message: "Please log in again." });
      return {};
    })
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type GalleryRouter = typeof router;

export const { GET, POST } = createRouteHandler({ router });
