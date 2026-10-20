import { NextResponse } from "next/server";
import { getActiveJobs } from "@/lib/careers";

export async function GET() {
  try {
    const jobs = await getActiveJobs();
    return NextResponse.json({ success: true, jobs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
