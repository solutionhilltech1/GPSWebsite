"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { genUploader } from "uploadthing/client";
import type { GalleryRouter } from "@/app/api/uploadthing/route";
import type { GalleryItem as PhotoItem } from "@/lib/gallery";
import styles from "./admin.module.css";
import { toast } from "react-toastify";

const ut = genUploader<GalleryRouter>();

// Upload straight to UploadThing, then return what /api/admin/gallery needs to save.
const sendToUploadThing = async (files: File[]) =>
  (await ut.uploadFiles("galleryImage", { files })).map((f) => ({ key: f.key, url: f.ufsUrl, name: f.name, size: f.size }));

interface AdminData {
  images: PhotoItem[];
  stats: {
    totalCount: number;
    totalSizeFormatted: string;
    categoryCount: Record<string, number>;
  };
}

const CATEGORY_OPTIONS = [
  "Construction Progress",
  "Structural Engineering",
  "Site Inspection",
  "Residential",
  "Commercial",
  "Site Architecture",
  "Milestone & Handover",
  "General",
];

export default function AdminClient() {
  // null = still checking the session cookie
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Edit modal state
  const [editingPhoto, setEditingPhoto] = useState<PhotoItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editRecordedDate, setEditRecordedDate] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editDeveloper, setEditDeveloper] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Replace photo modal state
  const [replaceTarget, setReplaceTarget] = useState<PhotoItem | null>(null);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  // Upload tab state
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Construction Progress");
  const [uploadTags, setUploadTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Fetch admin photos. A 401 means the session cookie is missing or expired.
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery", { cache: "no-store" });
      // Anything but 401 means the session is fine, so stay logged in even if the data failed to load.
      setIsAuthenticated(res.status !== 401);
      if (res.status === 401) return;
      const json = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
      if (!json.success) throw new Error(json.error);
      setData(json);
    } catch (err) {
      toast.error(`Failed to load gallery items: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // The cookie is httpOnly, so ask the server whether we're logged in.
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passcode }),
    });
    if (res.ok) {
      setAuthError("");
      setPasscode("");
      await loadData();
    } else {
      setAuthError("Incorrect HR Passcode. Please try again.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setIsAuthenticated(false);
    setData(null);
  };

  // Open Edit Modal
  const openEditModal = (photo: PhotoItem) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title);
    setEditCaption(photo.caption);
    setEditCategory(photo.category);
    setEditTags((photo.tags || []).join(", "));
    setEditLocation(photo.location);
    setEditRecordedDate(photo.recordedDate);
    setEditFile(null);
    setEditDeveloper(photo.developer);
  };

  // Save Edit Content
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    setIsSaving(true);
    try {
      const payload = {
        id: editingPhoto.id,
        title: editTitle,
        caption: editCaption,
        category: editCategory,
        tags: editTags,
        location: editLocation,
        recordedDate: editRecordedDate,
        ...(editFile && { file: (await sendToUploadThing([editFile]))[0] }),
        developer: editDeveloper,
      };

      const res = await fetch("/api/admin/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Photo content updated successfully!");
        setEditingPhoto(null);
        await loadData();
      } else {
        toast.error(result.error || "Failed to update content");
      }
    } catch {
      toast.error("Error updating photo content");
    } finally {
      setIsSaving(false);
    }
  };

  // Replace Photo File
  const handleReplacePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceTarget || !replacementFile) return;

    setIsReplacing(true);
    try {
      const [file] = await sendToUploadThing([replacementFile]);
      const res = await fetch("/api/admin/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: replaceTarget.id, file }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`Replaced photo "${replaceTarget.name}" with new image`);
        setReplaceTarget(null);
        setReplacementFile(null);
        await loadData();
      } else {
        toast.error(result.error || "Failed to replace photo");
      }
    } catch {
      toast.error("Error replacing photo");
    } finally {
      setIsReplacing(false);
    }
  };

  // Delete Photo
  const handleDeletePhoto = async (photo: PhotoItem) => {
    const confirmed = window.confirm(`Permanently remove "${photo.name}" from the gallery?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/gallery?id=${photo.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Photo "${photo.name}" deleted`);
        await loadData();
      } else {
        toast.error(result.error || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting photo");
    }
  };

  // Upload New Photos
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFiles || uploadFiles.length === 0) {
      toast.warn("Please choose at least one photo to upload");
      return;
    }

    setIsUploading(true);
    try {
      const files = await sendToUploadThing(Array.from(uploadFiles));
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files,
          title: uploadTitle,
          caption: uploadCaption,
          category: uploadCategory,
          tags: uploadTags,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`Successfully added ${result.uploaded} photo(s) to gallery!`);
        // Reset upload form
        setUploadFiles(null);
        setUploadTitle("");
        setUploadCaption("");
        setUploadTags("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setActiveTab("library");
        await loadData();
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error during upload");
    } finally {
      setIsUploading(false);
    }
  };

  // Filtered Photos List
  const filteredPhotos = useMemo(() => {
    if (!data?.images) return [];
    let list = [...data.images];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.caption.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "ALL") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    return list;
  }, [data?.images, searchQuery, selectedCategory]);

  // Lock background scroll when modal is active
  useEffect(() => {
    const isModalOpen = Boolean(editingPhoto || (replaceTarget && replacementFile));
    if (isModalOpen) {
      document.documentElement.classList.add("modal-open");
      document.body.classList.add("modal-open");
      (window as any).__lenis?.stop();
    } else {
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
      (window as any).__lenis?.start();
    }
    return () => {
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
      (window as any).__lenis?.start();
    };
  }, [editingPhoto, replaceTarget, replacementFile]);

  // Auth Gate
  if (isAuthenticated === null) {
    return (
      <main className={styles.adminPage}>
        <p style={{ textAlign: "center", padding: "120px 20px", color: "var(--muted)" }}>Checking access…</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className={styles.adminPage}>
        <div className={styles.authContainer}>
          <div className={styles.authCard}>
            <div className={styles.authIcon}>🔒</div>
            <div>
              <h1 className={styles.authTitle}>HR & Media Portal</h1>
              <p className={styles.authSubtitle}>
                GPS Prime Projects Management Access. Manage gallery photography, upload site updates, and edit content.
              </p>
            </div>

            <form onSubmit={handleLogin} className={styles.authForm}>
              <input
                type="password"
                placeholder="Enter HR Passcode"
                className={styles.authInput}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                required
              />

              {authError && <div className={styles.authError}>{authError}</div>}

              <button type="submit" className="btn btnGold">
                Access Portal
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.adminPage}>
      <div className="container">
        {/* Dashboard Header */}
        <header className={styles.dashHeader}>
          <div className={styles.dashTitleBlock}>
            <div className={styles.dashBreadcrumb}>Operations Portal / Gallery Content</div>
            <h1>HR Media Manager</h1>
          </div>

          <div className={styles.headerActions}>
            <Link href="/gallery" target="_blank" className={styles.publicLink}>
              View Live Gallery ↗
            </Link>
            <button onClick={handleLogout} className={styles.lockBtn} title="Lock Admin Portal">
              Lock Portal
            </button>
          </div>
        </header>

        {/* Real-time Stat Cards */}
        {data && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Photos</span>
              <span className={styles.statValue}>{data.stats.totalCount}</span>
              <span className={styles.statMeta}>Live on the website</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Categories</span>
              <span className={styles.statValue}>{Object.keys(data.stats.categoryCount).length}</span>
              <span className={styles.statMeta}>Organized themes</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Storage Footprint</span>
              <span className={styles.statValue}>{data.stats.totalSizeFormatted}</span>
              <span className={styles.statMeta}>High-resolution assets</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Public Sync</span>
              <span className={styles.statValue} style={{ color: "#10b981", fontSize: "1.6rem" }}>
                Active
              </span>
              <span className={styles.statMeta}>Real-time auto updates</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className={styles.tabsBar}>
          <button
            className={styles.tabBtn}
            data-active={activeTab === "library"}
            onClick={() => setActiveTab("library")}
          >
            📸 Photo Library & Content ({data?.images?.length || 0})
          </button>
          <button
            className={styles.tabBtn}
            data-active={activeTab === "upload"}
            onClick={() => setActiveTab("upload")}
          >
            ⬆ Upload New Photos
          </button>
        </div>

        {/* =========================================================
            TAB 1: PHOTO LIBRARY & CONTENT MANAGER
            ========================================================= */}
        {activeTab === "library" && (
          <div>
            <div className={styles.controlsRow}>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by title, caption, or filename..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className={styles.categoryFilter}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="ALL">All Categories</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {loading && !data && (
              <p style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                Loading photographs...
              </p>
            )}

            {filteredPhotos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", border: "1px dashed var(--line)" }}>
                <h3>No photographs match your filter</h3>
                <p style={{ color: "var(--muted)", margin: "10px 0 20px" }}>
                  Upload photos or adjust your search term.
                </p>
                <button className="btn btnGold" onClick={() => setActiveTab("upload")}>
                  Upload First Photo
                </button>
              </div>
            ) : (
              <div className={styles.photoGrid}>
                {filteredPhotos.map((photo) => (
                  <div key={photo.id} className={styles.photoCard}>
                    <div className={styles.thumbnailWrap}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${photo.src}?v=${photo.mtime}`}
                        alt={photo.title}
                        className={styles.thumbnailImg}
                        loading="lazy"
                      />
                      <span className={styles.categoryBadge}>{photo.category}</span>
                    </div>

                    <div className={styles.photoDetails}>
                      <h3 className={styles.photoTitle}>{photo.title}</h3>
                      <p className={styles.photoCaption}>{photo.caption}</p>

                      <div className={styles.tagsRow}>
                        {photo.tags.map((t) => (
                          <span key={t} className={styles.tagPill}>
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className={styles.metaRow}>
                        <span><strong>File:</strong> {photo.name}</span>
                        <span>{photo.sizeFormatted}</span>
                        <span>{photo.modifiedFormatted}</span>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => openEditModal(photo)}
                        title="Edit title, caption and details"
                      >
                        ✏️ Edit Content
                      </button>

                      <button
                        className={styles.replaceBtn}
                        onClick={() => {
                          setReplaceTarget(photo);
                          replaceInputRef.current?.click();
                        }}
                        title="Swap photo file with a new image"
                      >
                        🔄 Replace Image
                      </button>

                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeletePhoto(photo)}
                        title="Delete photo from gallery"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 2: UPLOAD CENTER
            ========================================================= */}
        {activeTab === "upload" && (
          <div className={styles.uploadSection}>
            <form onSubmit={handleUploadSubmit}>
              <div
                className={styles.dropArea}
                data-dragging={isDragging}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setUploadFiles(e.dataTransfer.files);
                  }
                }}
              >
                <div className={styles.dropIcon}>📁</div>
                <div>
                  <h3 className={styles.dropTitle}>
                    {uploadFiles && uploadFiles.length > 0
                      ? `${uploadFiles.length} file(s) selected: ${Array.from(uploadFiles).map((f) => f.name).join(", ")}`
                      : "Drag & drop photos here, or click to browse"}
                  </h3>
                  <p className={styles.dropSubtitle}>
                    Images up to 16 MB each, up to 20 at a time.
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setUploadFiles(e.target.files);
                  }
                }}
              />

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Title / Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Tower A Concrete Pouring Level 14"
                    className={styles.formInput}
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Category</label>
                  <select
                    className={styles.formSelect}
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                  <label className={styles.formLabel}>Caption / Description Content</label>
                  <textarea
                    placeholder="Describe what is taking place in this photograph (engineering details, site milestone, etc.)"
                    className={styles.formTextarea}
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                  <label className={styles.formLabel}>Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 54, Concrete, Superstructure, Meridian"
                    className={styles.formInput}
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.uploadSubmitRow}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setUploadFiles(null);
                    setUploadTitle("");
                    setUploadCaption("");
                    setUploadTags("");
                  }}
                >
                  Clear Form
                </button>

                <button type="submit" className="btn btnGold" disabled={isUploading}>
                  {isUploading ? "Uploading to Gallery..." : "Upload & Publish to Gallery"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Hidden File Input for Replacement Action */}
        <input
          ref={replaceInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0] && replaceTarget) {
              setReplacementFile(e.target.files[0]);
            }
          }}
        />

        {/* =========================================================
            EDIT PHOTO CONTENT MODAL
            ========================================================= */}
        {editingPhoto && (
          <div
            className={styles.modalBackdrop}
            data-lenis-prevent
            onClick={() => setEditingPhoto(null)}
          >
            <div
              className={styles.modalCard}
              data-lenis-prevent
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Edit Photograph Content</h2>
                <button className={styles.closeModalBtn} onClick={() => setEditingPhoto(null)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className={styles.modalBody}>
                  <div className={styles.modalPreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${editingPhoto.src}?v=${editingPhoto.mtime}`}
                      alt={editingPhoto.title}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Photo Title</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Caption & Architectural Description</label>
                    <textarea
                      className={styles.formTextarea}
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Category</label>
                    <select
                      className={styles.formSelect}
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tags (comma separated)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Location</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      maxLength={120}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Date Recorded</label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={editRecordedDate}
                      onChange={(e) => setEditRecordedDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Change Photo (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.formInput}
                      onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Developer</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={editDeveloper}
                      onChange={(e) => setEditDeveloper(e.target.value)}
                      maxLength={120}
                    />
                  </div>

                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setEditingPhoto(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btnGold" disabled={isSaving}>
                    {isSaving ? "Saving Changes..." : "Save Photo Content"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            CONFIRM REPLACE MODAL
            ========================================================= */}
        {replaceTarget && replacementFile && (
          <div
            className={styles.modalBackdrop}
            data-lenis-prevent
            onClick={() => setReplacementFile(null)}
          >
            <div
              className={styles.modalCard}
              data-lenis-prevent
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Confirm Photo Replacement</h2>
                <button
                  className={styles.closeModalBtn}
                  onClick={() => {
                    setReplaceTarget(null);
                    setReplacementFile(null);
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReplacePhoto}>
                <div className={styles.modalBody}>
                  <p style={{ fontSize: "0.9rem", color: "var(--ink)" }}>
                    You are replacing <strong>{replaceTarget.name}</strong> with{" "}
                    <strong>{replacementFile.name}</strong> ({replacementFile.size > 0 ? (replacementFile.size / 1024).toFixed(1) + " KB" : ""}).
                  </p>
                  <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                    The existing photo will be replaced on disk with this new file. All metadata, title, and captions will be preserved.
                  </p>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setReplaceTarget(null);
                      setReplacementFile(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btnGold" disabled={isReplacing}>
                    {isReplacing ? "Replacing Image..." : "Confirm Replacement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
