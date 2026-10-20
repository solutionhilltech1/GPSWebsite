import { cookies } from "next/headers";
import { ADMIN_COOKIE, checkPassword, isAdmin, sessionToken, setAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Session expired or unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword.trim() : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword.trim() : "";

    if (!currentPassword) {
      return Response.json({ error: "Current passcode is required." }, { status: 400 });
    }

    if (!newPassword) {
      return Response.json({ error: "New passcode is required." }, { status: 400 });
    }

    const isCurrentValid = await checkPassword(currentPassword);
    if (!isCurrentValid) {
      return Response.json({ error: "Current passcode is incorrect. Please verify and try again." }, { status: 400 });
    }

    if (newPassword.length < 4) {
      return Response.json({ error: "New passcode must be at least 4 characters long." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return Response.json({ error: "New passcodes do not match. Please re-enter." }, { status: 400 });
    }

    if (currentPassword === newPassword) {
      return Response.json({ error: "New passcode must be different from your existing passcode." }, { status: 400 });
    }

    // Update password in database
    await setAdminPassword(newPassword);

    // Renew the session cookie with the new HMAC so the current user remains logged in
    const newToken = await sessionToken(newPassword);
    (await cookies()).set(ADMIN_COOKIE, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return Response.json({
      success: true,
      message: "Passcode updated successfully. Your active session has been securely refreshed.",
    });
  } catch (err) {
    console.error("POST /api/admin/password error:", err);
    return Response.json({ error: "Failed to update passcode. Please try again." }, { status: 500 });
  }
}
