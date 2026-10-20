"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import AdminShell, { Icon } from "../AdminShell";
import adminStyles from "../admin.module.css";
import styles from "./settings.module.css";

interface AdminProfile {
  displayName: string;
  email: string;
  phone: string;
  department: string;
  notifyApplications: boolean;
  notifyInquiries: boolean;
  updatedAt?: string;
  passwordUpdatedAt?: string;
}

type SettingsTab = "password" | "profile" | "session";

export default function SettingsAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<SettingsTab>("password");
  const [loading, setLoading] = useState(true);

  // Profile State
  const [profile, setProfile] = useState<AdminProfile>({
    displayName: "HR Operations & Management",
    email: "connect@gpsprojects.co.in",
    phone: "+91 95603 24929",
    department: "HR & People Operations",
    notifyApplications: true,
    notifyInquiries: true,
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Fetch account data
  const loadAccount = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/account", { cache: "no-store" });
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load account settings");
      if (json.profile) {
        setProfile(json.profile);
      }
    } catch (err) {
      toast.error(`Error loading account: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

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
      await loadAccount();
    } else {
      setAuthError("Incorrect passcode. Please try again.");
    }
  };

  const handleLock = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setIsAuthenticated(false);
    toast.info("Portal locked successfully.");
  };

  // Submit Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.warn("Please enter your current passcode.");
      return;
    }
    if (newPassword.length < 4) {
      toast.warn("New passcode must be at least 4 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warn("The new passcodes do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      toast.warn("New passcode must be different from current passcode.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to change passcode.");
      }

      toast.success("Passcode changed successfully! Active session refreshed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Reload profile to refresh password updatedAt timestamp
      await loadAccount();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update passcode.");
    } finally {
      setSavingPassword(false);
    }
  };

  // Submit Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save profile.");
      }

      toast.success("Account profile updated successfully.");
      if (json.profile) setProfile(json.profile);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // 1. Loading state
  if (isAuthenticated === null || loading) {
    return (
      <main className={adminStyles.adminPage}>
        <div className={adminStyles.authContainer}>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>Verifying credentials…</p>
        </div>
      </main>
    );
  }

  // 2. Auth Lock Screen
  if (!isAuthenticated) {
    return (
      <main className={adminStyles.adminPage}>
        <div className={adminStyles.authContainer}>
          <div className={adminStyles.authCard}>
            <div className={adminStyles.authIcon}>
              <Icon name="lock" size={24} />
            </div>
            <div>
              <h1 className={adminStyles.authTitle}>HR Portal Security</h1>
              <p className={adminStyles.authSubtitle}>
                Enter the administrative passcode to access settings and account configurations.
              </p>
            </div>
            <form onSubmit={handleLogin} className={adminStyles.authForm}>
              <input
                type="password"
                placeholder="Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className={adminStyles.authInput}
                autoFocus
                required
              />
              {authError && <p className={adminStyles.authError}>{authError}</p>}
              <button type="submit" className="btn btnGold" style={{ width: "100%", justifyContent: "center" }}>
                Unlock Portal
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // 3. Main Settings View
  return (
    <AdminShell
      active="/admin/settings"
      title="Settings & Account"
      subtitle="Manage HR security credentials, administrative passcode, and account profile."
      onLock={handleLock}
      actions={
        <button type="button" className={styles.dangerBtn} onClick={handleLock}>
          <Icon name="lock" size={16} />
          Lock Portal
        </button>
      }
    >
      <div className={styles.container}>
        {/* Top Stat Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Access Status</span>
            <span className={styles.statValue}>
              <span className={styles.activeDot} />
              Active
            </span>
            <span className={styles.statMeta}>Session valid for 12 hours</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Current Role</span>
            <span className={styles.statValue}>HR Admin</span>
            <span className={styles.statMeta}>{profile.department}</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Passcode Security</span>
            <span className={styles.statValue}>Encrypted</span>
            <span className={styles.statMeta}>
              {profile.passwordUpdatedAt
                ? `Last rotated ${new Date(profile.passwordUpdatedAt).toLocaleDateString("en-IN")}`
                : "Protected via MongoDB"}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabsBar} role="tablist">
          <button
            type="button"
            className={styles.tabBtn}
            role="tab"
            aria-selected={activeTab === "password"}
            data-active={activeTab === "password"}
            onClick={() => setActiveTab("password")}
          >
            <Icon name="key" size={16} />
            Security & Passcode
          </button>
          <button
            type="button"
            className={styles.tabBtn}
            role="tab"
            aria-selected={activeTab === "profile"}
            data-active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          >
            <Icon name="user" size={16} />
            Account Profile
          </button>
          <button
            type="button"
            className={styles.tabBtn}
            role="tab"
            aria-selected={activeTab === "session"}
            data-active={activeTab === "session"}
            onClick={() => setActiveTab("session")}
          >
            <Icon name="shield" size={16} />
            Session & Policies
          </button>
        </div>

        {/* TAB 1: Password & Security */}
        {activeTab === "password" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Change Admin Passcode</h2>
                <p className={styles.cardSubtitle}>
                  Update the master passcode used to unlock the HR & Operations portal.
                </p>
              </div>
            </div>

            <div className={styles.infoCallout}>
              <span className={styles.infoIcon}>ⓘ</span>
              <div className={styles.infoText}>
                <strong>Session Continuity:</strong> When you change the passcode, your current session cookie is
                automatically renewed with the new key so you stay logged in without disruption.
              </div>
            </div>

            <form onSubmit={handleChangePassword} className={styles.formGridSingle}>
              {/* Current Password */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Current Passcode</label>
                <div className={styles.inputWrap}>
                  <input
                    type={showCurrent ? "text" : "password"}
                    className={`${styles.input} ${styles.inputWithButton}`}
                    placeholder="Enter current passcode"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.toggleEyeBtn}
                    onClick={() => setShowCurrent(!showCurrent)}
                    aria-label={showCurrent ? "Hide passcode" : "Show passcode"}
                  >
                    {showCurrent ? "Hide" : "Show"}
                  </button>
                </div>
                <span className={styles.helpText}>Default passcode is initially 123 unless updated.</span>
              </div>

              {/* New Password */}
              <div className={styles.formGroup}>
                <label className={styles.label}>New Passcode</label>
                <div className={styles.inputWrap}>
                  <input
                    type={showNew ? "text" : "password"}
                    className={`${styles.input} ${styles.inputWithButton}`}
                    placeholder="Enter new passcode (min. 4 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={4}
                  />
                  <button
                    type="button"
                    className={styles.toggleEyeBtn}
                    onClick={() => setShowNew(!showNew)}
                    aria-label={showNew ? "Hide passcode" : "Show passcode"}
                  >
                    {showNew ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm New Passcode</label>
                <div className={styles.inputWrap}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    className={`${styles.input} ${styles.inputWithButton}`}
                    placeholder="Re-enter new passcode"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={4}
                  />
                  <button
                    type="button"
                    className={styles.toggleEyeBtn}
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide passcode" : "Show passcode"}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
                {newPassword && confirmPassword && (
                  <span
                    className={styles.helpText}
                    style={{ color: newPassword === confirmPassword ? "#047857" : "#dc2626" }}
                  >
                    {newPassword === confirmPassword ? "✓ Passcodes match" : "✕ Passcodes do not match"}
                  </span>
                )}
              </div>

              {/* Checklist */}
              <div className={styles.securityList}>
                <div className={styles.securityItem} data-valid={newPassword.length >= 4}>
                  <span>{newPassword.length >= 4 ? "✓" : "○"}</span>
                  <span>Minimum 4 characters</span>
                </div>
                <div
                  className={styles.securityItem}
                  data-valid={Boolean(newPassword && newPassword === confirmPassword)}
                >
                  <span>{newPassword && newPassword === confirmPassword ? "✓" : "○"}</span>
                  <span>Confirmation matches new passcode</span>
                </div>
                <div
                  className={styles.securityItem}
                  data-valid={Boolean(newPassword && currentPassword && newPassword !== currentPassword)}
                >
                  <span>{newPassword && currentPassword && newPassword !== currentPassword ? "✓" : "○"}</span>
                  <span>Different from current passcode</span>
                </div>
              </div>

              <div className={styles.actionRow}>
                <button type="submit" className={`${styles.saveBtn} ${styles.saveBtnGold}`} disabled={savingPassword}>
                  <Icon name="check" size={16} />
                  {savingPassword ? "Updating Passcode…" : "Update Passcode"}
                </button>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Clear Fields
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Account Profile */}
        {activeTab === "profile" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Account & HR Profile</h2>
                <p className={styles.cardSubtitle}>
                  Set up contact channels, team details, and incoming alert preferences.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Display Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  placeholder="e.g. HR Operations & Management"
                  required
                />
                <span className={styles.helpText}>Visible across internal audit logs and communications.</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Department / Division</label>
                <input
                  type="text"
                  className={styles.input}
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  placeholder="e.g. HR & People Operations"
                />
                <span className={styles.helpText}>Organizational role identifier.</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>HR Alert Email</label>
                <input
                  type="email"
                  className={styles.input}
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="e.g. connect@gpsprojects.co.in"
                  required
                />
                <span className={styles.helpText}>Primary recipient for candidate submissions and notifications.</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>HR Desk Phone</label>
                <input
                  type="tel"
                  className={styles.input}
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91 95603 24929"
                />
                <span className={styles.helpText}>Direct helpline for candidates and vendor inquiries.</span>
              </div>

              {/* Notification Toggles */}
              <div className={styles.formGroupFull}>
                <label className={styles.label} style={{ marginBottom: "8px" }}>
                  Notification Preferences
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label className={styles.toggleRow}>
                    <div className={styles.toggleContent}>
                      <span className={styles.toggleTitle}>Job Application Alerts</span>
                      <span className={styles.toggleDesc}>
                        Receive real-time notifications whenever a candidate applies for open positions.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={profile.notifyApplications}
                      onChange={(e) => setProfile({ ...profile, notifyApplications: e.target.checked })}
                    />
                  </label>

                  <label className={styles.toggleRow}>
                    <div className={styles.toggleContent}>
                      <span className={styles.toggleTitle}>Security & Credential Alerts</span>
                      <span className={styles.toggleDesc}>
                        Log security events when the administrative passcode or settings are modified.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={profile.notifyInquiries}
                      onChange={(e) => setProfile({ ...profile, notifyInquiries: e.target.checked })}
                    />
                  </label>
                </div>
              </div>

              <div className={`${styles.formGroupFull} ${styles.actionRow}`}>
                <button type="submit" className={`${styles.saveBtn} ${styles.saveBtnGold}`} disabled={savingProfile}>
                  <Icon name="check" size={16} />
                  {savingProfile ? "Saving Profile…" : "Save Profile"}
                </button>
                <button type="button" className={styles.secondaryBtn} onClick={loadAccount}>
                  Reset to Saved
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: Session & Policies */}
        {activeTab === "session" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Session Security & Policies</h2>
                <p className={styles.cardSubtitle}>
                  Current session details, security policies, and administrative tools.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: "20px" }}>
              <div className={styles.toggleRow} style={{ cursor: "default" }}>
                <div className={styles.toggleContent}>
                  <span className={styles.toggleTitle}>Session Cookie Protection</span>
                  <span className={styles.toggleDesc}>
                    Stored under <code>gps_admin</code> with <code>httpOnly</code>, <code>strict sameSite</code>, and
                    secure HMAC authentication.
                  </span>
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#047857" }}>ENFORCED</span>
              </div>

              <div className={styles.toggleRow} style={{ cursor: "default" }}>
                <div className={styles.toggleContent}>
                  <span className={styles.toggleTitle}>Session Inactivity Timeout</span>
                  <span className={styles.toggleDesc}>
                    Sessions expire automatically after 12 hours of inactivity to prevent unauthorized access.
                  </span>
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--gold)" }}>12 HOURS</span>
              </div>

              <div className={styles.toggleRow} style={{ cursor: "default" }}>
                <div className={styles.toggleContent}>
                  <span className={styles.toggleTitle}>Connected Database</span>
                  <span className={styles.toggleDesc}>
                    MongoDB Atlas instance storing positions, media, and security settings.
                  </span>
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#047857" }}>CONNECTED</span>
              </div>
            </div>

            {/* Quick Links & Danger Area */}
            <div className={styles.dangerZone} style={{ padding: "20px", background: "#fef2f2" }}>
              <h3 style={{ fontSize: "1rem", color: "#991b1b", marginBottom: "6px" }}>Terminate Active Session</h3>
              <p style={{ fontSize: "0.84rem", color: "#b91c1c", marginBottom: "16px" }}>
                Lock this browser window immediately. You will need to enter the passcode again to regain access.
              </p>
              <button type="button" className={styles.dangerBtn} onClick={handleLock}>
                <Icon name="lock" size={16} />
                Lock Portal Now
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
