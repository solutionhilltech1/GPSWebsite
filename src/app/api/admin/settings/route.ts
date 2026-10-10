import { revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { site } from "@/data/site";
import {
  DEFAULT_PRESET_CHANNELS,
  SETTINGS_TAG,
  normalizeUrl,
  settingsCollection,
  type SocialLink,
} from "@/lib/settings";

const unauthorized = () => Response.json({ error: "Please log in again." }, { status: 401 });
const badRequest = (error: string) => Response.json({ error }, { status: 400 });

export async function GET() {
  if (!(await isAdmin())) return unauthorized();

  try {
    const col = await settingsCollection();
    const doc = await col.findOne({ _id: "global" });

    if (doc) {
      // Merge with default preset channels if any preset channel is missing
      const existingSocials = Array.isArray(doc.socials) ? doc.socials : [];
      const existingIds = new Set(existingSocials.map((s) => s.id));

      const mergedSocials: SocialLink[] = [...existingSocials];
      for (const preset of DEFAULT_PRESET_CHANNELS) {
        if (!existingIds.has(preset.id)) {
          mergedSocials.push({
            id: preset.id,
            label: preset.label,
            url: "",
          });
        }
      }

      return Response.json({
        success: true,
        settings: {
          phone: doc.phone?.trim() || site.phone,
          email: doc.email?.trim() || site.email,
          socials: mergedSocials,
        },
      });
    }
  } catch (err) {
    console.error("GET /api/admin/settings error:", err);
  }

  // Initial defaults
  return Response.json({
    success: true,
    settings: {
      phone: site.phone,
      email: site.email,
      socials: DEFAULT_PRESET_CHANNELS.map((ch) => ({
        id: ch.id,
        label: ch.label,
        url: "",
      })),
    },
  });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return unauthorized();

  const body = await request.json().catch(() => ({}));
  const phone = typeof body.phone === "string" ? body.phone.trim() : site.phone;
  const email = typeof body.email === "string" ? body.email.trim() : site.email;

  if (typeof body.socials !== "undefined" && !Array.isArray(body.socials)) {
    return badRequest("Invalid socials data format.");
  }

  const rawSocials = Array.isArray(body.socials) ? body.socials : [];
  const cleanSocials: SocialLink[] = rawSocials
    .filter((s: unknown) => s && typeof s === "object")
    .map((s: { id?: unknown; label?: unknown; url?: unknown }, idx: number) => {
      const rawLabel = typeof s.label === "string" ? s.label.trim() : `Channel ${idx + 1}`;
      const rawId = typeof s.id === "string" && s.id.trim() ? s.id.trim() : rawLabel.toLowerCase().replace(/[^a-z0-9]/g, "");
      const rawUrl = typeof s.url === "string" ? s.url.trim() : "";
      return {
        id: rawId,
        label: rawLabel,
        url: normalizeUrl(rawUrl),
      };
    });

  try {
    const col = await settingsCollection();
    await col.updateOne(
      { _id: "global" },
      {
        $set: {
          phone,
          email,
          socials: cleanSocials,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Revalidate settings cache tag with expire: 0 so the public site updates immediately
    revalidateTag(SETTINGS_TAG, { expire: 0 });

    return Response.json({
      success: true,
      message: "Settings updated successfully.",
      settings: {
        phone,
        email,
        socials: cleanSocials,
      },
    });
  } catch (err) {
    console.error("PUT /api/admin/settings error:", err);
    return Response.json({ error: "Failed to save settings to database." }, { status: 500 });
  }
}

export const POST = PUT;
