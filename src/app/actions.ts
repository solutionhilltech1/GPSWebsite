"use server";

import nodemailer from "nodemailer";
import { site } from "@/data/site";

const mailer = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_PORT === "465",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export type EnquiryState = { ok: boolean; message: string } | null;

const field = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);

export async function sendEnquiry(_prev: EnquiryState, form: FormData): Promise<EnquiryState> {
  // Honeypot: real users never see this field, bots fill it.
  if (field(form, "company")) return { ok: true, message: "Thank you. We'll be in touch." };

  const enquiry = {
    name: field(form, "name", 80),
    phone: field(form, "phone", 20),
    email: field(form, "email", 120),
    project: field(form, "project", 80),
    message: field(form, "message", 2000),
  };

  if (enquiry.name.length < 2) return { ok: false, message: "Please enter your name." };
  if (!/^\+?[\d\s-]{8,16}$/.test(enquiry.phone)) return { ok: false, message: "Please enter a valid phone number." };
  if (enquiry.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email))
    return { ok: false, message: "That email doesn't look right." };

  try {
    await mailer.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO || site.email || "connect@gpsprojects.co.in",
      replyTo: enquiry.email || undefined,
      subject: `New enquiry: ${enquiry.name.replace(/\s+/g, " ")}${enquiry.project ? ` (${enquiry.project})` : ""}`,
      text: Object.entries(enquiry)
        .map(([key, value]) => `${key}: ${value || "-"}`)
        .join("\n"),
    });
  } catch (err) {
    // Keep the lead in the server log so it can be recovered by hand.
    console.error("Enquiry email failed", err, enquiry);
    return { ok: false, message: `Sorry, we couldn't send that. Please call us on ${site.phone}.` };
  }

  return { ok: true, message: `Thank you, ${enquiry.name}. Our team will call you within 24 hours.` };
}
