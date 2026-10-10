"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import AdminShell, { Icon } from "../AdminShell";
import adminStyles from "../admin.module.css";
import styles from "./socials.module.css";

interface SocialChannelItem {
  id: string;
  label: string;
  url: string;
  isCustom?: boolean;
}

interface SiteSettingsState {
  phone: string;
  email: string;
  socials: SocialChannelItem[];
}

const PRESET_BADGES: Record<string, { badgeClass: string; short: string }> = {
  youtube: { badgeClass: styles.badgeYoutube, short: "YT" },
  instagram: { badgeClass: styles.badgeInstagram, short: "IG" },
  linkedin: { badgeClass: styles.badgeLinkedin, short: "IN" },
  facebook: { badgeClass: styles.badgeFacebook, short: "FB" },
  twitter: { badgeClass: styles.badgeTwitter, short: "X" },
  whatsapp: { badgeClass: styles.badgeWhatsapp, short: "WA" },
};

export default function SocialsAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettingsState | null>(null);

  // Load current settings from API
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load settings");

      const rawSocials = Array.isArray(json.settings?.socials) ? json.settings.socials : [];
      setSettings({
        phone: json.settings?.phone || "+91 95603 24929",
        email: json.settings?.email || "connect@gpsprojectsprivatelimited.com",
        socials: rawSocials.map((s: SocialChannelItem) => ({
          id: s.id,
          label: s.label,
          url: s.url || "",
          isCustom: !PRESET_BADGES[s.id.toLowerCase()],
        })),
      });
    } catch (err) {
      toast.error(`Error loading settings: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handle HR Passcode Login
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
      await loadSettings();
    } else {
      setAuthError("Incorrect HR Passcode. Please try again.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setIsAuthenticated(false);
    setSettings(null);
  };

  // Channel manipulation
  const handleUrlChange = (id: string, url: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socials: settings.socials.map((ch) => (ch.id === id ? { ...ch, url } : ch)),
    });
  };

  const handleLabelChange = (id: string, label: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socials: settings.socials.map((ch) => (ch.id === id ? { ...ch, label } : ch)),
    });
  };

  const handleClearUrl = (id: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socials: settings.socials.map((ch) => (ch.id === id ? { ...ch, url: "" } : ch)),
    });
  };

  const handleRemoveChannel = (id: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socials: settings.socials.filter((ch) => ch.id !== id),
    });
  };

  const handleAddChannel = () => {
    if (!settings) return;
    const newId = `custom-${Date.now()}`;
    setSettings({
      ...settings,
      socials: [
        ...settings.socials,
        {
          id: newId,
          label: "Custom Channel",
          url: "",
          isCustom: true,
        },
      ],
    });
  };

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: settings.phone,
          email: settings.email,
          socials: settings.socials.map((s) => ({
            id: s.id,
            label: s.label,
            url: s.url,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update settings");
      }

      toast.success("Footer & social media links updated! Live now on website.");
      // Reload updated settings
      await loadSettings();
    } catch (err) {
      toast.error(`Save failed: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  // Auth Gate
  if (isAuthenticated === false) {
    return (
      <main className={adminStyles.adminPage}>
        <div className={adminStyles.authContainer}>
          <div className={adminStyles.authCard}>
            <div className={adminStyles.authIcon}>
              <Icon name="lock" size={24} />
            </div>
            <h1 className={adminStyles.authTitle}>HR Operations Portal</h1>
            <p className={adminStyles.authSubtitle}>Enter the HR security passcode to manage social media links and footer contact details.</p>
            <form onSubmit={handleLogin} className={adminStyles.authForm}>
              <input
                type="password"
                placeholder="Enter HR Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className={adminStyles.authInput}
                autoFocus
                required
              />
              {authError && <p className={adminStyles.authError}>{authError}</p>}
              <button type="submit" className="btn btnGold">
                Unlock Portal
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  if (loading || !settings) {
    return (
      <main className={adminStyles.adminPage}>
        <p style={{ textAlign: "center", padding: "120px 20px", color: "var(--muted)" }}>Loading social media settings…</p>
      </main>
    );
  }

  const activeSocials = settings.socials.filter((s) => s.url.trim().length > 0);

  return (
    <AdminShell
      active="/admin/socials"
      title="Social Media & Footer"
      subtitle="Manage social channels and footer contact details. Changes appear live on the website as soon as you save."
      onLock={handleLogout}
      actions={
        <button type="button" onClick={handleSave} disabled={saving} className="btn btnGold">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      }
    >
      <form onSubmit={handleSave} className={styles.container}>
        {/* Info Explainer */}
        <div className={styles.infoCallout}>
          <div className={styles.infoIcon}>💡</div>
          <div className={styles.infoText}>
            <strong>How this works:</strong> Type or paste the link for any social media platform you want visible on the website footer.
            If a platform link is left empty, <strong>that platform is automatically hidden from the footer</strong>.
            Click <strong>Save Changes</strong> to instantly publish the update.
          </div>
        </div>

        {/* Social Media Channels */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Social Media Channels</h2>
              <p className={styles.cardSubtitle}>
                Add or edit your official social links. {activeSocials.length} of {settings.socials.length} channels currently active.
              </p>
            </div>
          </div>

          <div className={styles.channelList}>
            {settings.socials.map((channel) => {
              const preset = PRESET_BADGES[channel.id.toLowerCase()];
              const isActive = channel.url.trim().length > 0;
              const badgeClass = preset ? preset.badgeClass : styles.badgeCustom;
              const badgeText = preset ? preset.short : channel.label.slice(0, 2).toUpperCase();

              return (
                <div key={channel.id} className={styles.channelRow} data-active={isActive}>
                  {/* Channel Identity */}
                  <div className={styles.channelMeta}>
                    <div className={`${styles.channelBadge} ${badgeClass}`}>{badgeText}</div>
                    {channel.isCustom ? (
                      <input
                        type="text"
                        value={channel.label}
                        onChange={(e) => handleLabelChange(channel.id, e.target.value)}
                        placeholder="Platform name"
                        className={styles.channelNameInput}
                        required
                      />
                    ) : (
                      <span className={styles.channelName}>{channel.label}</span>
                    )}
                  </div>

                  {/* URL Input */}
                  <div className={styles.urlInputWrapper}>
                    <input
                      type="text"
                      value={channel.url}
                      onChange={(e) => handleUrlChange(channel.id, e.target.value)}
                      placeholder={`Enter ${channel.label} URL (e.g. https://${channel.id.toLowerCase()}.com/...)`}
                      className={styles.urlInput}
                    />
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isActive ? (
                      <span className={`${styles.statusIndicator} ${styles.statusActive}`}>
                        <span className={styles.statusActiveDot} />
                        Live in Footer
                      </span>
                    ) : (
                      <span className={`${styles.statusIndicator} ${styles.statusHidden}`}>
                        <span className={styles.statusHiddenDot} />
                        Hidden (No Link)
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={styles.actionsGroup}>
                    {channel.url.trim() ? (
                      <a
                        href={channel.url.startsWith("http") ? channel.url : `https://${channel.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.testLinkBtn}
                        title="Test link in new tab"
                      >
                        ↗
                      </a>
                    ) : (
                      <button type="button" disabled className={styles.testLinkBtn} title="No link entered">
                        ↗
                      </button>
                    )}

                    {isActive && (
                      <button
                        type="button"
                        onClick={() => handleClearUrl(channel.id)}
                        className={styles.removeBtn}
                        title="Clear link (hide from footer)"
                      >
                        ✕
                      </button>
                    )}

                    {channel.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChannel(channel.id)}
                        className={styles.removeBtn}
                        title="Delete custom platform"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <button type="button" onClick={handleAddChannel} className={styles.addChannelBtn}>
              <Icon name="plus" size={16} />
              Add Custom Social Platform
            </button>
          </div>
        </section>

        {/* Footer Contact Details */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Footer Contact Information</h2>
              <p className={styles.cardSubtitle}>
                Official phone number and email address shown in the footer and contact sections across the website.
              </p>
            </div>
          </div>

          <div className={styles.contactGrid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="contactPhone" className={styles.fieldLabel}>
                Phone Number
              </label>
              <input
                id="contactPhone"
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+91 95603 24929"
                className={styles.fieldInput}
                required
              />
              <span className={styles.fieldHelper}>
                Clicking this on mobile or desktop launches the phone dialer.
              </span>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="contactEmail" className={styles.fieldLabel}>
                Email Address
              </label>
              <input
                id="contactEmail"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="connect@gpsprojectsprivatelimited.com"
                className={styles.fieldInput}
                required
              />
              <span className={styles.fieldHelper}>
                Website visitors clicking this will open their default email client.
              </span>
            </div>
          </div>
        </section>

        {/* Live Website Footer Preview */}
        <section className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <div className={styles.previewBadge}>
              <span className={styles.previewBadgeDot} />
              Live Footer Preview
            </div>
            <span className={styles.previewSub}>
              This is how the &ldquo;Get in touch&rdquo; footer column looks with your current settings:
            </span>
          </div>

          <div className={styles.previewFooterBox}>
            <h3 className={styles.previewColTitle}>Get in touch</h3>

            {settings.phone ? (
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className={styles.previewContactLink}>
                {settings.phone}
              </a>
            ) : null}

            {settings.email ? (
              <a href={`mailto:${settings.email}`} className={styles.previewContactLink}>
                {settings.email}
              </a>
            ) : null}

            {activeSocials.length > 0 ? (
              <div className={styles.previewSocialsRow}>
                {activeSocials.map((s) => (
                  <span key={s.id} className={styles.previewSocialTag}>
                    {s.label} ↗
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles.previewEmptyNotice}>
                No social links currently active. Enter a URL above to show it here.
              </p>
            )}
          </div>
        </section>

        {/* Save Bar */}
        <div className={styles.saveBar}>
          <span className={styles.saveNotice}>
            Don&apos;t forget to save your changes when you are ready to publish.
          </span>
          <button type="submit" disabled={saving} className="btn btnGold">
            {saving ? "Saving Changes…" : "Save Changes"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
