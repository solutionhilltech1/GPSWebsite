import { getAdminProfile, isAdmin, setAdminProfile } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Session expired or unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const profile = await getAdminProfile();
    return Response.json({ success: true, profile });
  } catch (err) {
    console.error("GET /api/admin/account error:", err);
    return Response.json({ error: "Failed to load account profile." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Session expired or unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const department = typeof body.department === "string" ? body.department.trim() : "";
    const notifyApplications = typeof body.notifyApplications === "boolean" ? body.notifyApplications : true;
    const notifyInquiries = typeof body.notifyInquiries === "boolean" ? body.notifyInquiries : true;

    if (!displayName) {
      return Response.json({ error: "Display name cannot be empty." }, { status: 400 });
    }

    if (!email) {
      return Response.json({ error: "Contact email cannot be empty." }, { status: 400 });
    }

    await setAdminProfile({
      displayName,
      email,
      phone,
      department,
      notifyApplications,
      notifyInquiries,
    });

    const updated = await getAdminProfile();

    return Response.json({
      success: true,
      message: "Account profile updated successfully.",
      profile: updated,
    });
  } catch (err) {
    console.error("PUT /api/admin/account error:", err);
    return Response.json({ error: "Failed to update account profile." }, { status: 500 });
  }
}
