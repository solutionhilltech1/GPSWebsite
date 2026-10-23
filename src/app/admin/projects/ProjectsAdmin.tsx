"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { genUploader } from "uploadthing/client";
import type { GalleryRouter } from "@/app/api/uploadthing/route";
import { categories, statuses, type StoredImage } from "@/lib/project-fields";
import type { AdminProject } from "@/lib/projects";
import AdminShell, { Icon } from "../AdminShell";
import styles from "../admin.module.css";

const ut = genUploader<GalleryRouter>();
const upload = async (files: File[]): Promise<StoredImage[]> =>
  files.length ? (await ut.uploadFiles("projectImage", { files })).map((f) => ({ key: f.key, url: f.ufsUrl })) : [];

// The editor keeps facts and highlights as plain text: one per line, facts as "Label: Value".
type Draft = Omit<AdminProject, "id" | "facts" | "highlights" | "rera" | "image"> & {
  id?: string;
  image: StoredImage | null;
  facts: string;
  highlights: string;
  rera: string;
};

const blank = (order: number): Draft => ({
  name: "",
  slug: "",
  category: categories[0],
  status: statuses[0],
  location: "",
  tagline: "",
  description: "",
  image: null,
  gallery: [],
  facts: "",
  highlights: "",
  rera: "",
  order,
});

const toDraft = (p: AdminProject): Draft => ({
  ...p,
  image: p.image ?? null,
  facts: p.facts.map((f) => `${f.label}: ${f.value}`).join("\n"),
  highlights: p.highlights.join("\n"),
  rera: p.rera ?? "",
});

// null = not logged in
const fetchProjects = async (): Promise<AdminProject[] | null> => {
  const res = await fetch("/api/admin/projects", { cache: "no-store" });
  if (res.status === 401) return null;
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.projects;
};

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

// Preview of a picked file. The blob URL is made once per file and freed on unmount
// (inline createObjectURL made a new, never-freed copy of every photo on each keystroke).
function FilePreview({ file, alt }: { file: File; alt: string }) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    ref.current!.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} alt={alt} />;
}

export default function ProjectsAdmin() {
  // null = still checking the session cookie
  const [projects, setProjects] = useState<AdminProject[] | null>(null);
  const [loggedOut, setLoggedOut] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    () =>
      fetchProjects()
        .then((list) => (list ? setProjects(list) : setLoggedOut(true)))
        .catch((err) => toast.error(err.message || "Could not load projects")),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const open = (d: Draft) => {
    setDraft(d);
    setCoverFile(null);
    setGalleryFiles([]);
  };
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    try {
      // Photos go straight to UploadThing first; the project record only stores the returned links.
      const [cover] = await upload(coverFile ? [coverFile] : []);
      const added = await upload(galleryFiles);
      const res = await fetch("/api/admin/projects", {
        method: draft.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          image: cover ?? draft.image,
          gallery: [...draft.gallery, ...added],
          facts: lines(draft.facts).map((l) => {
            const i = l.indexOf(":");
            return i > 0 ? { label: l.slice(0, i), value: l.slice(i + 1) } : { label: l, value: "" };
          }),
          highlights: lines(draft.highlights),
        }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      toast.success(`"${draft.name}" saved`);
      setDraft(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "Could not save the project");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: AdminProject) => {
    if (!window.confirm(`Permanently delete "${p.name}" and all its photos?`)) return;
    const result = await (await fetch(`/api/admin/projects?id=${p.id}`, { method: "DELETE" })).json().catch(() => ({}));
    if (result.success) {
      toast.success(`"${p.name}" deleted`);
      await load();
    } else toast.error(result.error || "Could not delete the project");
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
            <p className={styles.authSubtitle}>Log in on the portal, then come back to manage projects.</p>
            <Link href="/admin" className="btn btnGold">
              Go to login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!projects) {
    return (
      <main className={styles.adminPage}>
        <p style={{ textAlign: "center", padding: "120px 20px", color: "var(--muted)" }}>Loading projects…</p>
      </main>
    );
  }

  const live = projects.filter((p) => p.image).length;

  return (
    <AdminShell
      active="/admin/projects"
      title="Projects"
      subtitle="Changes go live on the website as soon as you save."
      onLock={logout}
      actions={
        <button className="btn btnGold" onClick={() => open(blank((projects.at(-1)?.order ?? 0) + 1))}>
          <Icon name="plus" size={16} />
          New project
        </button>
      }
    >
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Projects</span>
          <span className={styles.statValue}>{projects.length}</span>
          <span className={styles.statMeta}>In the database</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Live</span>
          <span className={styles.statValue}>{live}</span>
          <span className={styles.statMeta}>Shown on the website</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Drafts</span>
          <span className={styles.statValue}>{projects.length - live}</span>
          <span className={styles.statMeta}>Hidden until they have a cover photo</span>
        </div>
      </div>

      <div className={styles.photoGrid}>
        {projects.map((p) => (
          <div key={p.id} className={styles.photoCard}>
            <div className={styles.thumbnailWrap}>
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image.url} alt={p.name} className={styles.thumbnailImg} loading="lazy" />
              ) : (
                <div className={styles.noCover}>No cover photo · hidden from the site</div>
              )}
              <span className={styles.categoryBadge}>{p.category}</span>
            </div>
            <div className={styles.photoDetails}>
              <h3 className={styles.photoTitle}>{p.name}</h3>
              <p className={styles.photoCaption}>{p.location}</p>
              <div className={styles.metaRow}>
                <span className={styles.status} data-status={p.status}>
                  {p.status}
                </span>
                <span>{p.gallery.length} gallery photos</span>
                <span>Position {p.order}</span>
              </div>
            </div>
            <div className={styles.cardActions}>
              <button className={styles.editBtn} onClick={() => open(toDraft(p))}>
                <Icon name="edit" />
                Edit project
              </button>
              <button className={styles.deleteBtn} onClick={() => remove(p)} title="Delete project" aria-label={`Delete ${p.name}`}>
                <Icon name="trash" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {draft && (
        <div className={styles.modalBackdrop} data-lenis-prevent onClick={() => !saving && setDraft(null)}>
          <div className={styles.modalCard} data-lenis-prevent onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{draft.id ? `Edit ${draft.name}` : "New project"}</h2>
              <button className={styles.closeModalBtn} onClick={() => setDraft(null)} disabled={saving}>
                ✕
              </button>
            </div>

            <form onSubmit={save}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Cover photo (required to show on the site)</label>
                  <div className={styles.modalPreview}>
                    {coverFile ? (
                      <FilePreview file={coverFile} alt="Cover" />
                    ) : (
                      draft.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={draft.image.url} alt="Cover" />
                      )
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className={styles.formInput}
                    onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Name</label>
                    <input
                      className={styles.formInput}
                      value={draft.name}
                      onChange={(e) => set("name", e.target.value)}
                      maxLength={120}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Category</label>
                    <select
                      className={styles.formSelect}
                      value={draft.category}
                      onChange={(e) => set("category", e.target.value as Draft["category"])}
                    >
                      {categories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Status</label>
                    <select
                      className={styles.formSelect}
                      value={draft.status}
                      onChange={(e) => set("status", e.target.value as Draft["status"])}
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Location</label>
                    <input
                      className={styles.formInput}
                      value={draft.location}
                      onChange={(e) => set("location", e.target.value)}
                      maxLength={160}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Order on /projects (lower first)</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={draft.order}
                      onChange={(e) => set("order", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tagline (big heading on the project page)</label>
                  <input
                    className={styles.formInput}
                    value={draft.tagline}
                    onChange={(e) => set("tagline", e.target.value)}
                    maxLength={160}
                  />
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
                    <label className={styles.formLabel}>Key facts: one per line, &quot;Label: Value&quot;</label>
                    <textarea
                      className={styles.formTextarea}
                      value={draft.facts}
                      onChange={(e) => set("facts", e.target.value)}
                      placeholder={"Type: Commercial\nFloors: 8"}
                      rows={4}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Highlights: one per line</label>
                    <textarea
                      className={styles.formTextarea}
                      value={draft.highlights}
                      onChange={(e) => set("highlights", e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>RERA number (optional)</label>
                  <input
                    className={styles.formInput}
                    value={draft.rera}
                    onChange={(e) => set("rera", e.target.value)}
                    maxLength={80}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Gallery photos (shown on the project page, in this order)</label>
                  <div className={styles.thumbRow}>
                    {draft.gallery.map((g, i) => (
                      <div key={g.key} className={styles.thumb}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={g.url} alt={`Gallery ${i + 1}`} />
                        <button
                          type="button"
                          title="Remove from gallery"
                          onClick={() => set("gallery", draft.gallery.filter((x) => x.key !== g.key))}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {galleryFiles.map((f) => (
                      <div key={f.name + f.size} className={styles.thumb} data-new>
                        <FilePreview file={f} alt={f.name} />
                        <button type="button" title="Don't add" onClick={() => setGalleryFiles(galleryFiles.filter((x) => x !== f))}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className={styles.formInput}
                    onChange={(e) => setGalleryFiles([...galleryFiles, ...Array.from(e.target.files ?? [])])}
                  />
                  <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    Removed photos are deleted from storage when you save.
                  </p>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn" onClick={() => setDraft(null)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btnGold" disabled={saving}>
                  {saving ? "Uploading & saving…" : "Save project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
