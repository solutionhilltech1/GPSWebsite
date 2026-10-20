"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import AdminShell, { Icon } from "../AdminShell";
import styles from "../admin.module.css";
import c from "./careers.module.css";
import {
  DEPARTMENTS,
  JOB_TYPES,
  JOB_STATUSES,
  APPLICATION_STATUSES,
  type JobDoc,
  type JobApplicationDoc,
  type JobDepartment,
  type JobType,
  type JobStatus,
  type ApplicationStatus,
} from "@/lib/career-fields";

type Tab = "jobs" | "applications";

// The editor keeps responsibilities and requirements as plain text, one per line.
type Draft = Omit<JobDoc, "id" | "responsibilities" | "requirements" | "salary" | "createdAt" | "updatedAt"> & {
  id?: string;
  salary: string;
  responsibilities: string;
  requirements: string;
};

const blank = (order: number): Draft => ({
  title: "",
  slug: "",
  department: DEPARTMENTS[0],
  location: "Etah, Uttar Pradesh",
  type: "Full-Time",
  experience: "",
  salary: "",
  tagline: "",
  description: "",
  responsibilities: "",
  requirements: "",
  status: "Active",
  featured: false,
  order,
});

const toDraft = (j: JobDoc): Draft => ({
  ...j,
  salary: j.salary ?? "",
  responsibilities: j.responsibilities.join("\n"),
  requirements: j.requirements.join("\n"),
});

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

const post = async (method: string, url: string, body?: unknown) => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new Error(data.error || "Request failed");
  return data;
};

export default function CareersAdmin() {
  // jobs === null: still checking the session cookie
  const [jobs, setJobs] = useState<JobDoc[] | null>(null);
  const [applications, setApplications] = useState<JobApplicationDoc[]>([]);
  const [loggedOut, setLoggedOut] = useState(false);

  const [tab, setTab] = useState<Tab>("jobs");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [appStatusFilter, setAppStatusFilter] = useState("ALL");
  const [query, setQuery] = useState("");

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/careers", { cache: "no-store" });
      if (res.status === 401) return setLoggedOut(true);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setJobs(data.jobs);
      setApplications(data.applications);
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "Could not load careers data");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    try {
      await post("POST", "/api/admin/careers", {
        ...draft,
        responsibilities: lines(draft.responsibilities),
        requirements: lines(draft.requirements),
      });
      toast.success(`"${draft.title}" saved`);
      setDraft(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the job");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (job: JobDoc) => {
    const status: JobStatus = job.status === "Active" ? "Closed" : "Active";
    try {
      await post("POST", "/api/admin/careers", { ...job, status });
      toast.success(`"${job.title}" is now ${status.toLowerCase()}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the job");
    }
  };

  const remove = async (job: JobDoc) => {
    if (!window.confirm(`Permanently delete "${job.title}"? Applications already received are kept.`)) return;
    try {
      await post("DELETE", `/api/admin/careers?id=${encodeURIComponent(job.id)}`);
      toast.success(`"${job.title}" deleted`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the job");
    }
  };

  const setApplicationStatus = async (id: string, status: ApplicationStatus) => {
    try {
      await post("PATCH", "/api/admin/careers", { id, status });
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the applicant");
    }
  };

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setLoggedOut(true);
  };

  if (loggedOut) {
    return (
      <main className={styles.adminPage}>
        <div className={styles.authContainer}>
          <div className={styles.authCard}>
            <div className={styles.authIcon}>
              <Icon name="lock" size={24} />
            </div>
            <h1 className={styles.authTitle}>Session expired</h1>
            <p className={styles.authSubtitle}>Log in on the portal, then come back to manage careers.</p>
            <Link href="/admin" className="btn btnGold">
              Go to login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!jobs) {
    return (
      <main className={styles.adminPage}>
        <p style={{ textAlign: "center", padding: "120px 20px", color: "var(--muted)" }}>Loading careers…</p>
      </main>
    );
  }

  const q = query.trim().toLowerCase();
  const shownJobs = jobs.filter(
    (j) => (deptFilter === "ALL" || j.department === deptFilter) && (statusFilter === "ALL" || j.status === statusFilter),
  );
  const shownApps = applications.filter(
    (a) =>
      (appStatusFilter === "ALL" || a.status === appStatusFilter) &&
      (!q || [a.name, a.email, a.phone, a.jobTitle].some((f) => f.toLowerCase().includes(q))),
  );
  const newCount = applications.filter((a) => a.status === "New").length;

  return (
    <AdminShell
      active="/admin/careers"
      title="Careers"
      subtitle="Job postings go live on the website as soon as you save. Applications arrive here and by email."
      onLock={logout}
      actions={
        <button className="btn btnGold" onClick={() => setDraft(blank((jobs.at(-1)?.order ?? 0) + 1))}>
          <Icon name="plus" size={16} />
          New job
        </button>
      }
    >
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Open roles</span>
          <span className={styles.statValue}>{jobs.filter((j) => j.status === "Active").length}</span>
          <span className={styles.statMeta}>Shown on the website</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Drafts &amp; closed</span>
          <span className={styles.statValue}>{jobs.filter((j) => j.status !== "Active").length}</span>
          <span className={styles.statMeta}>Hidden from the website</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>New applications</span>
          <span className={styles.statValue}>{newCount}</span>
          <span className={styles.statMeta}>Not yet reviewed</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>All applications</span>
          <span className={styles.statValue}>{applications.length}</span>
          <span className={styles.statMeta}>Since launch</span>
        </div>
      </div>

      <div className={styles.tabsBar} role="tablist">
        <button className={styles.tabBtn} role="tab" aria-selected={tab === "jobs"} data-active={tab === "jobs"} onClick={() => setTab("jobs")}>
          Job postings ({jobs.length})
        </button>
        <button
          className={styles.tabBtn}
          role="tab"
          aria-selected={tab === "applications"}
          data-active={tab === "applications"}
          onClick={() => setTab("applications")}
        >
          Applications ({applications.length})
        </button>
      </div>

      {tab === "jobs" ? (
        <>
          <div className={styles.controlsRow}>
            <div className={c.filters}>
              <select className={styles.categoryFilter} aria-label="Department" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                <option value="ALL">All departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <select className={styles.categoryFilter} aria-label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All statuses</option>
                {JOB_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <span className={c.count}>
              {shownJobs.length} of {jobs.length} jobs
            </span>
          </div>

          {shownJobs.length === 0 ? (
            <p className={c.empty}>{jobs.length ? "No jobs match these filters." : "No jobs yet. Add the first one with New job."}</p>
          ) : (
            <div className={c.jobs}>
              {shownJobs.map((job) => {
                const apps = applications.filter((a) => a.jobId === job.id).length;
                return (
                  <div key={job.id} className={c.job}>
                    <div className={c.jobMain}>
                      <div className={c.jobTitleRow}>
                        <h3 className={styles.photoTitle}>{job.title}</h3>
                        <span className={c.pill} data-s={job.status}>
                          {job.status}
                        </span>
                        {job.featured && <span className={c.pill} data-s="Featured">Featured</span>}
                      </div>
                      <p className={c.jobMeta}>
                        {[job.department, job.location, job.type, job.experience].filter(Boolean).join(" · ")}
                      </p>
                      <p className={c.jobMeta}>
                        Position {job.order} · {apps} {apps === 1 ? "application" : "applications"}
                      </p>
                    </div>
                    <div className={c.jobActions}>
                      <button className={styles.editBtn} onClick={() => setDraft(toDraft(job))}>
                        <Icon name="edit" />
                        Edit
                      </button>
                      <button className={styles.replaceBtn} onClick={() => toggleStatus(job)}>
                        {job.status === "Active" ? "Close role" : "Reopen"}
                      </button>
                      <button className={styles.deleteBtn} onClick={() => remove(job)} title="Delete job" aria-label={`Delete ${job.title}`}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <div className={styles.controlsRow}>
            <div className={c.filters}>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>
                  <Icon name="search" size={16} />
                </span>
                <input
                  className={styles.searchInput}
                  placeholder="Search name, email, phone or role"
                  aria-label="Search applications"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select className={styles.categoryFilter} aria-label="Status" value={appStatusFilter} onChange={(e) => setAppStatusFilter(e.target.value)}>
                <option value="ALL">All statuses</option>
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <span className={c.count}>
              {shownApps.length} of {applications.length} applications
            </span>
          </div>

          {shownApps.length === 0 ? (
            <p className={c.empty}>
              {applications.length ? "No applications match these filters." : "No applications yet. Submissions from the Careers page appear here."}
            </p>
          ) : (
            <div className={c.tableWrap}>
              <table className={c.table}>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Role</th>
                    <th>Contact</th>
                    <th>Experience</th>
                    <th>Resume &amp; note</th>
                    <th>Received</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shownApps.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>{a.name}</strong>
                        {a.currentCompany && <span className={c.sub}>{a.currentCompany}</span>}
                      </td>
                      <td>
                        {a.jobTitle}
                        <span className={c.sub}>{a.department}</span>
                      </td>
                      <td>
                        <a href={`tel:${a.phone.replace(/\s/g, "")}`}>{a.phone}</a>
                        <a href={`mailto:${a.email}`}>{a.email}</a>
                      </td>
                      <td>{a.experience}</td>
                      <td>
                        {a.resumeUrl ? (
                          <a href={a.resumeUrl} target="_blank" rel="noopener noreferrer">
                            Open resume ↗
                          </a>
                        ) : (
                          <span className={c.sub}>No resume link</span>
                        )}
                        {a.coverLetter && (
                          <details>
                            <summary>Read note</summary>
                            <p>{a.coverLetter}</p>
                          </details>
                        )}
                      </td>
                      <td className={c.nowrap}>
                        {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        <select
                          className={`${styles.categoryFilter} ${c.statusSelect}`}
                          data-s={a.status}
                          aria-label={`Status for ${a.name}`}
                          value={a.status}
                          onChange={(e) => setApplicationStatus(a.id, e.target.value as ApplicationStatus)}
                        >
                          {APPLICATION_STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {draft && (
        <div className={styles.modalBackdrop} data-lenis-prevent onClick={() => !saving && setDraft(null)}>
          <div className={styles.modalCard} data-lenis-prevent onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{draft.id ? `Edit ${draft.title}` : "New job"}</h2>
              <button className={styles.closeModalBtn} onClick={() => setDraft(null)} disabled={saving} aria-label="Close">
                ✕
              </button>
            </div>

            <form onSubmit={save}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Job title</label>
                  <input
                    className={styles.formInput}
                    value={draft.title}
                    onChange={(e) => set("title", e.target.value)}
                    maxLength={120}
                    required
                    autoFocus
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Department</label>
                    <select
                      className={styles.formSelect}
                      value={draft.department}
                      onChange={(e) => set("department", e.target.value as JobDepartment)}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Job type</label>
                    <select className={styles.formSelect} value={draft.type} onChange={(e) => set("type", e.target.value as JobType)}>
                      {JOB_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Location</label>
                    <input className={styles.formInput} value={draft.location} onChange={(e) => set("location", e.target.value)} maxLength={120} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Experience</label>
                    <input
                      className={styles.formInput}
                      value={draft.experience}
                      onChange={(e) => set("experience", e.target.value)}
                      placeholder="e.g. 3-5 years"
                      maxLength={60}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Compensation (optional)</label>
                    <input
                      className={styles.formInput}
                      value={draft.salary}
                      onChange={(e) => set("salary", e.target.value)}
                      placeholder="Shown to candidates as written"
                      maxLength={120}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Status</label>
                    <select className={styles.formSelect} value={draft.status} onChange={(e) => set("status", e.target.value as JobStatus)}>
                      {JOB_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Summary line</label>
                  <input className={styles.formInput} value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={200} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description</label>
                  <textarea
                    className={styles.formTextarea}
                    value={draft.description}
                    onChange={(e) => set("description", e.target.value)}
                    maxLength={2000}
                    rows={4}
                  />
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Responsibilities: one per line</label>
                    <textarea className={styles.formTextarea} value={draft.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} rows={6} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Requirements: one per line</label>
                    <textarea className={styles.formTextarea} value={draft.requirements} onChange={(e) => set("requirements", e.target.value)} rows={6} />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Order on /careers (lower first)</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={draft.order}
                      onChange={(e) => set("order", Number(e.target.value))}
                    />
                  </div>
                  <label className={c.check}>
                    <input type="checkbox" checked={draft.featured} onChange={(e) => set("featured", e.target.checked)} />
                    Mark as featured
                  </label>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn" onClick={() => setDraft(null)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btnGold" disabled={saving}>
                  {saving ? "Saving…" : "Save job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
