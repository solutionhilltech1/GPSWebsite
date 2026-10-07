"use client";

import { useActionState } from "react";
import { sendEnquiry } from "@/app/actions";
import { projects } from "@/data/site";
import styles from "./EnquiryForm.module.css";

export default function EnquiryForm({ project = "" }: { project?: string }) {
  const [state, action, pending] = useActionState(sendEnquiry, null);

  if (state?.ok) {
    return (
      <p className={styles.success} role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className={styles.form}>
      <label>
        <span>Name</span>
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        <span>Phone</span>
        <input name="phone" type="tel" required autoComplete="tel" />
      </label>
      <label>
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" />
      </label>
      <label>
        <span>Interested in</span>
        <select name="project" defaultValue={project}>
          <option value="">General enquiry</option>
          {projects.map((p) => (
            <option key={p.slug} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.full}>
        <span>Message</span>
        <textarea name="message" rows={3} />
      </label>
      <input name="company" tabIndex={-1} autoComplete="off" className={styles.trap} aria-hidden="true" />

      <div className={styles.full}>
        <button className="btn btnGold" disabled={pending}>
          {pending ? "Sending…" : "Request a call back"}
        </button>
        {state && !state.ok && (
          <p className={styles.error} role="alert">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
