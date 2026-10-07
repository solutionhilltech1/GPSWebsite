"use server";

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

  // ponytail: logs only. Send to email (e.g. Resend) or the client's CRM before launch.
  console.log("New enquiry", enquiry);

  return { ok: true, message: `Thank you, ${enquiry.name}. Our team will call you within 24 hours.` };
}
