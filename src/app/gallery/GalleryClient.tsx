"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { GalleryItem } from "@/lib/gallery";
import styles from "./gallery.module.css";

interface ApiResponse {
  success: boolean;
  images: GalleryItem[];
  count: number;
  hash: string;
}

export default function GalleryClient() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [viewLayout, setViewLayout] = useState<"masonry" | "uniform" | "showcase">("uniform");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showInfoSidebar, setShowInfoSidebar] = useState(true);
  const [newImageIds, setNewImageIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const lastHashRef = useRef<string>("");
  const knownIdsRef = useRef<Set<string>>(new Set());

  // Show a momentary toast notification
  const triggerToast = useCallback((title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Fetch gallery photos from API
  const fetchGallery = useCallback(async () => {
    try {
      const res = await fetch(`/api/gallery?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) throw new Error("Failed to fetch gallery");
      const data: ApiResponse = await res.json();

      if (data.success) {
        // Check for additions/removals if already initialized
        if (knownIdsRef.current.size > 0 && data.hash !== lastHashRef.current) {
          const currentIds = new Set(data.images.map((i) => i.id));
          const added = data.images.filter((i) => !knownIdsRef.current.has(i.id));
          const removed = Array.from(knownIdsRef.current).filter((id) => !currentIds.has(id));

          if (added.length > 0) {
            triggerToast(
              "Photo Added",
              added.length === 1 ? `"${added[0].title}" added to gallery` : `${added.length} new photos added to gallery`
            );

            setNewImageIds((prev) => {
              const next = new Set(prev);
              added.forEach((i) => next.add(i.id));
              return next;
            });

            setTimeout(() => {
              setNewImageIds((prev) => {
                const next = new Set(prev);
                added.forEach((i) => next.delete(i.id));
                return next;
              });
            }, 10000);
          }

          if (removed.length > 0) {
            triggerToast(
              "Photo Removed",
              removed.length === 1 ? "Photo removed from gallery" : `${removed.length} photos removed`
            );
          }
        }

        knownIdsRef.current = new Set(data.images.map((i) => i.id));
        lastHashRef.current = data.hash;
        setImages(data.images);
      }
    } catch {
      // Quiet background retry
    } finally {
      setInitialLoaded(true);
    }
  }, [triggerToast]);

  // Dynamic Auto-sync Polling in background & Window Focus Events
  useEffect(() => {
    fetchGallery();

    const pollInterval = setInterval(() => {
      fetchGallery();
    }, 2000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchGallery();
      }
    };

    const onFocus = () => {
      fetchGallery();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchGallery]);

  // Lightbox keyboard controls
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
      } else if (e.key.toLowerCase() === "i") {
        setShowInfoSidebar((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, images.length]);

  // Lock background scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
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
  }, [lightboxIndex]);

  const activePhoto = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <section className={styles.gallerySection}>
      <div className="container">
        {/* Subtle top toolbar with count and layout switcher */}
        <div className={styles.headerBar}>
          <span className={styles.photoCount}>
            {images.length} {images.length === 1 ? "Photograph" : "Photographs"} Archive
          </span>

          <div className={styles.viewToggle} role="group" aria-label="Layout view">
            <button
              className={styles.viewBtn}
              data-active={viewLayout === "uniform"}
              onClick={() => setViewLayout("uniform")}
              title="Standard Grid"
            >
              ⊞
            </button>
            <button
              className={styles.viewBtn}
              data-active={viewLayout === "masonry"}
              onClick={() => setViewLayout("masonry")}
              title="Masonry Wall"
            >
              ▦
            </button>
            <button
              className={styles.viewBtn}
              data-active={viewLayout === "showcase"}
              onClick={() => setViewLayout("showcase")}
              title="Showcase"
            >
              ▭
            </button>
          </div>
        </div>

        {/* Gallery Grid or Empty State */}
        {initialLoaded && images.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", border: "1px dashed var(--line)" }}>
            <h2 style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: "2rem" }}>
              No Photographs Yet
            </h2>
            <p style={{ color: "var(--muted)", margin: "12px 0" }}>
              New site photography is on its way. Check back soon.
            </p>
          </div>
        ) : (
          <div
            className={
              viewLayout === "masonry"
                ? styles.gridMasonry
                : viewLayout === "uniform"
                ? styles.gridUniform
                : styles.gridShowcase
            }
          >
            {images.map((photo, index) => {
              const isNewlyAdded = newImageIds.has(photo.id);

              return (
                <div
                  key={photo.id}
                  className={styles.card}
                  onClick={() => {
                    setLightboxIndex(index);
                    setShowInfoSidebar(true);
                  }}
                >
                  <div className={styles.cardMedia}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${photo.src}?v=${photo.mtime}`}
                      alt={photo.title}
                      loading="lazy"
                      className={styles.cardImg}
                    />

                    {isNewlyAdded && <span className={styles.newBadge}>NEW</span>}

                    {/* Hover Overlay Hint */}
                    <div className={styles.cardOverlay}>
                      <span className={styles.zoomPill}>View Details ⛶</span>
                    </div>
                  </div>

                  {/* Card Title & Description Content Block */}
                  <div className={styles.cardContent}>
                    <span className={styles.cardCategory}>{photo.category}</span>
                    <h3 className={styles.cardTitle}>{photo.title}</h3>
                    <p className={styles.cardDesc}>{photo.caption}</p>

                    <div className={styles.cardMetaRow}>
                      <span>{photo.modifiedFormatted}</span>
                      <span className={styles.viewDetailsLink}>Explore Details →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Alert for dynamic updates */}
      {toast && (
        <div className={styles.toast}>
          <span style={{ color: "var(--gold)", fontSize: "1.2rem" }}>✦</span>
          <div>
            <div className={styles.toastTitle}>{toast.title}</div>
            <div className={styles.toastMsg}>{toast.message}</div>
          </div>
        </div>
      )}

      {/* =========================================================
          DETAILED INFORMATION MODAL (WHEN CLICKED ON IMAGE)
          ========================================================= */}
      {activePhoto && lightboxIndex !== null && (
        <div
          className={styles.lightboxBackdrop}
          data-lenis-prevent
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Controls: Toggle Info & Close */}
          <button
            className={styles.toggleInfoBtn}
            onClick={(e) => {
              e.stopPropagation();
              setShowInfoSidebar((prev) => !prev);
            }}
            title="Toggle Details Panel (Shortcut: I)"
          >
            <span>ℹ</span>
            <span>{showInfoSidebar ? "Hide Details" : "Show Details"}</span>
          </button>

          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
          >
            ✕
          </button>

          <div
            className={styles.modalContainer}
            data-lenis-prevent
            data-has-sidebar={showInfoSidebar}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nav Arrows */}
            {images.length > 1 && (
              <>
                <button
                  className={styles.navPrev}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1);
                  }}
                  aria-label="Previous photograph"
                >
                  ←
                </button>
                <button
                  className={styles.navNext}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0);
                  }}
                  aria-label="Next photograph"
                >
                  →
                </button>
              </>
            )}

            {/* Left/Center: High-resolution Image Stage */}
            <div className={styles.lightboxStage} onClick={() => setLightboxIndex(null)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${activePhoto.src}?v=${activePhoto.mtime}`}
                alt={activePhoto.title}
                className={styles.lightboxImage}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Right: Detailed Information Sidebar */}
            {showInfoSidebar && (
              <aside className={styles.detailsSidebar} data-lenis-prevent>
                <div className={styles.sidebarHeader}>
                  <span className={styles.sidebarCategory}>{activePhoto.category}</span>
                  <span className={styles.sidebarCounter}>
                    [{lightboxIndex + 1} / {images.length}]
                  </span>
                </div>

                <h2 className={styles.sidebarTitle}>{activePhoto.title}</h2>

                <p className={styles.sidebarDesc}>{activePhoto.caption}</p>

                {activePhoto.tags && activePhoto.tags.length > 0 && (
                  <div className={styles.tagsWrap}>
                    {activePhoto.tags.map((tag) => (
                      <span key={tag} className={styles.tagChip}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Technical Specifications & Site Information */}
                <div className={styles.specsSection}>
                  <h4 className={styles.specsTitle}>Site & Asset Details</h4>

                  <div className={styles.specsList}>
                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Location</span>
                      <span className={styles.specValue}>Sector 54, Gurugram</span>
                    </div>

                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Category</span>
                      <span className={styles.specValue}>{activePhoto.category}</span>
                    </div>

                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Date Recorded</span>
                      <span className={styles.specValue}>{activePhoto.modifiedFormatted}</span>
                    </div>

                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Format & Size</span>
                      <span className={styles.specValue}>
                        {activePhoto.extension} · {activePhoto.sizeFormatted}
                      </span>
                    </div>

                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>File Reference</span>
                      <span className={styles.specValue}>{activePhoto.name}</span>
                    </div>

                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Developer</span>
                      <span className={styles.specValue}>GPS Prime Projects</span>
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
