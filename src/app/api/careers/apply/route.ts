import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createJobApplication } from "@/lib/careers";
import { site } from "@/data/site";

const mailer = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_PORT === "465",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, jobTitle, department, name, email, phone, experience, currentCompany, resumeUrl, coverLetter } = body;

    // Basic validation
    if (!name || String(name).trim().length < 2) {
      return NextResponse.json({ success: false, error: "Please enter your full name." }, { status: 400 });
    }
    if (!phone || !/^\+?[\d\s-]{8,16}$/.test(String(phone).trim())) {
      return NextResponse.json({ success: false, error: "Please provide a valid contact phone number." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    const application = await createJobApplication({
      jobId: String(jobId || "general"),
      jobTitle: String(jobTitle || "General Application").trim(),
      department: String(department || "General").trim(),
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      experience: String(experience || "Not specified").trim(),
      currentCompany: String(currentCompany || "").trim(),
      resumeUrl: String(resumeUrl || "").trim(),
      coverLetter: String(coverLetter || "").trim(),
    });

    // Notify HR team via Email asynchronously if email credentials exist
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await mailer.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: process.env.EMAIL_TO || site.email,
          replyTo: application.email,
          subject: `New Job Application: ${application.name} for ${application.jobTitle}`,
          text: `A new candidate has submitted an application on the GPS Projects Careers Portal:

Candidate Name: ${application.name}
Role Applied: ${application.jobTitle} (${application.department})
Phone: ${application.phone}
Email: ${application.email}
Experience: ${application.experience}
Current Company: ${application.currentCompany || "N/A"}
Resume / Portfolio URL: ${application.resumeUrl || "None provided"}

Cover Letter / Notes:
${application.coverLetter || "None"}

View and manage this candidate in the HR Portal:
${site.url}/admin/careers
`,
        });
      }
    } catch (mailErr) {
      console.warn("Could not send HR notification email for application:", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Thank you, ${application.name}. Your application for ${application.jobTitle} has been received. Our HR department will review your profile and reach out shortly.`,
      applicationId: application.id,
    });
  } catch (err: any) {
    console.error("Job application submission error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to submit application" }, { status: 500 });
  }
}
