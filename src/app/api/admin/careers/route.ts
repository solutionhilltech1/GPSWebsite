import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  getAllJobsForAdmin,
  getApplications,
  saveJob,
  deleteJob,
  updateApplication,
  type ApplicationStatus,
} from "@/lib/careers";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [jobs, applications] = await Promise.all([
      getAllJobsForAdmin(),
      getApplications(),
    ]);

    return NextResponse.json({ success: true, jobs, applications });
  } catch (err: any) {
    console.error("Failed to load admin careers data:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title || !String(body.title).trim()) {
      return NextResponse.json({ success: false, error: "Job title is required" }, { status: 400 });
    }

    const saved = await saveJob(body);
    return NextResponse.json({ success: true, job: saved });
  } catch (err: any) {
    console.error("Failed to save job in HR portal:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
    }

    const ok = await deleteJob(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    console.error("Failed to delete job in HR portal:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, notes } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Application ID is required" }, { status: 400 });
    }

    const ok = await updateApplication(id, {
      status: status as ApplicationStatus,
      notes,
    });

    return NextResponse.json({ success: ok });
  } catch (err: any) {
    console.error("Failed to update candidate application:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
