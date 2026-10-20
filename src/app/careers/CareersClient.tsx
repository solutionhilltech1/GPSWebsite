"use client";

import { useEffect, useState } from "react";
import { DEPARTMENTS, type JobDoc } from "@/lib/career-fields";
import styles from "./careers.module.css";

type Target = {
  id: string;
  title: string;
  department: string;
  subtitle: string;
  featured?: boolean;
};

const GENERAL: Target = {
  id: "general",
  title: "General application",
  department: "General",
  subtitle: "Talent network",
  featured: false,
};

export default function CareersClient({ jobs }: { jobs: JobDoc[] }) {
  const [dept, setDept] = useState("ALL");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const [target, setTarget] = useState<Target | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const q = query.trim().toLowerCase();
  const visible = jobs.filter(
    (j) =>
      (dept === "ALL" || j.department === dept) &&
      (!q || [j.title, j.department, j.location, j.tagline].some((f) => f?.toLowerCase().includes(q))),
  );
  const departments = DEPARTMENTS.filter((d) => jobs.some((j) => j.department === d));

  const openForm = (t: Target) => {
    setTarget(t);
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    if (!submitting) setTarget(null);
  };

  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeForm();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, submitting]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!target) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: target.id,
          jobTitle: target.title,
          department: target.department,
          ...Object.fromEntries(new FormData(e.currentTarget)),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Could not submit your application.");
      setSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.intro} data-reveal>
        <div>
          <span className="eyebrow">Open positions</span>
          <h2 className="display h2">
            {jobs.length ? (
              <>
                {jobs.length} {jobs.length === 1 ? "role" : "roles"} <em>open</em>
              </>
            ) : (
              <>
                No open roles <em>right now</em>
              </>
            )}
          </h2>
        </div>
        <button type="button" className="btn" onClick={() => openForm(GENERAL)}>
          General application
        </button>
      </div>

      {jobs.length > 3 && (
        <div className={styles.filters} data-reveal>
          <div className={styles.depts} role="group" aria-label="Filter by department">
            {["ALL", ...departments].map((d) => (
              <button
                key={d}
                type="button"
                className={styles.dept}
                aria-pressed={dept === d}
                onClick={() => setDept(d)}
              >
                {d === "ALL" ? "All" : d}
              </button>
            ))}
          </div>
          <input
            type="search"
            className={styles.search}
            placeholder="Search roles"
            aria-label="Search roles"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      <div className={styles.list} data-reveal>
        {visible.map((job, i) => {
          const open = openId === job.id;
          return (
            <article key={job.id} className={styles.row}>
              <div className={styles.rowHead}>
                <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className={styles.titleWrap}>
                    <h3 className={styles.title}>
                      <button
                        type="button"
                        className={styles.toggle}
                        aria-expanded={open}
                        aria-controls={`role-${job.id}`}
                        onClick={() => setOpenId(open ? null : job.id)}
                      >
                        {job.title}
                      </button>
                    </h3>
                    {job.featured && (
                      <span className={styles.badgeHiring}>
                        <span className={styles.pulseDot} aria-hidden="true" />
                        Actively hiring
                      </span>
                    )}
                  </div>
                  <p className={styles.meta}>
                    {[job.department, job.location, job.type].join(" · ")}
                  </p>
                </div>
                <button type="button" className={`btn btnGold ${styles.apply}`} onClick={() => openForm({
                  id: job.id,
                  title: job.title,
                  department: job.department,
                  subtitle: `${job.department} · ${job.location}`,
                  featured: job.featured,
                })}>
                  Apply
                </button>
              </div>

              <div id={`role-${job.id}`} className={`${styles.panel} ${open ? styles.panelOpen : ""}`}>
                <div className={styles.panelInner}>
                  <div className={styles.detail}>
                    {job.tagline && <p className={styles.tagline}>{job.tagline}</p>}
                    {job.description && <p className={styles.desc}>{job.description}</p>}

                    <dl className={styles.facts}>
                      <div>
                        <dt>Experience</dt>
                        <dd>{job.experience}</dd>
                      </div>
                      {job.salary && (
                        <div>
                          <dt>Compensation</dt>
                          <dd>{job.salary}</dd>
                        </div>
                      )}
                    </dl>

                    <div className={styles.lists}>
                      {job.responsibilities.length > 0 && (
                        <div>
                          <h4>Responsibilities</h4>
                          <ul>
                            {job.responsibilities.map((r, k) => (
                              <li key={k}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {job.requirements.length > 0 && (
                        <div>
                          <h4>Requirements</h4>
                          <ul>
                            {job.requirements.map((r, k) => (
                              <li key={k}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {visible.length === 0 && (
          <p className={styles.empty}>
            {jobs.length
              ? "No roles match your search."
              : "We have no open roles at the moment. Send a general application and we will keep your details for future openings."}
          </p>
        )}
      </div>

      {target && (
        <div className={styles.modalBackdrop} data-lenis-prevent onClick={closeForm}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHead}>
              <div>
                <div className={styles.modalMeta}>
                  <span className="eyebrow">{target.subtitle}</span>
                  {target.featured && (
                    <span className={styles.badgeHiring}>
                      <span className={styles.pulseDot} aria-hidden="true" />
                      Actively hiring
                    </span>
                  )}
                </div>
                <h3 id="apply-title" className="display h3">
                  {target.title}
                </h3>
              </div>
              <button type="button" className={styles.close} onClick={closeForm} aria-label="Close">
                ✕
              </button>
            </div>

            {success ? (
              <div className={styles.success} role="status">
                <p className="display h3">Application received</p>
                <p>{success}</p>
                <button type="button" className="btn btnGold" onClick={closeForm}>
                  Back to roles
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={submit}>
                <label>
                  <span>Full name</span>
                  <input name="name" required autoComplete="name" autoFocus />
                </label>
                <label>
                  <span>Phone</span>
                  <input name="phone" type="tel" required autoComplete="tel" placeholder="+91" />
                </label>
                <label>
                  <span>Email</span>
                  <input name="email" type="email" required autoComplete="email" />
                </label>
                <label>
                  <span>Experience</span>
                  <input name="experience" required placeholder="e.g. 5 years, RCC structures" />
                </label>
                <label>
                  <span>Current or last company</span>
                  <input name="currentCompany" autoComplete="organization" />
                </label>
                <label>
                  <span>Resume link</span>
                  <input name="resumeUrl" type="url" placeholder="Drive, Dropbox or LinkedIn URL" />
                </label>
                <label className={styles.full}>
                  <span>Note (optional)</span>
                  <textarea name="coverLetter" rows={3} placeholder="Projects you have worked on, certifications, when you can join" />
                </label>

                <div className={`${styles.full} ${styles.actions}`}>
                  <button className="btn btnGold" disabled={submitting}>
                    {submitting ? "Sending…" : "Submit application"}
                  </button>
                  {error && (
                    <p className={styles.error} role="alert">
                      {error}
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
