import { cookies } from "next/headers";
import { ADMIN_COOKIE, checkPassword, hasAdminPasswordConfigured, sessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  if (!hasAdminPasswordConfigured()) {
    return Response.json(
      {
        error:
          "ADMIN_PASSWORD is not configured on the server. Please add ADMIN_PASSWORD to your Vercel Project Environment Variables and redeploy.",
      },
      { status: 500 }
    );
  }

  const { password } = await request.json().catch(() => ({}));
  if (typeof password !== "string" || !checkPassword(password)) {
    return Response.json({ error: "Incorrect passcode." }, { status: 401 });
  }
  (await cookies()).set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return Response.json({ success: true });
}

export async function DELETE() {
  (await cookies()).delete(ADMIN_COOKIE);
  return Response.json({ success: true });
}
