import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "gps_admin";

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export const getAdminPassword = () => {
  const raw = process.env.ADMIN_PASSWORD;
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

export const hasAdminPasswordConfigured = () => Boolean(getAdminPassword());

// session token is an HMAC of the password, so changing ADMIN_PASSWORD logs everyone out.
// Add a sessions collection if you ever need per-user logins or revocation.
export const sessionToken = () => {
  const secret = getAdminPassword();
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured");
  return createHmac("sha256", secret).update("gps-admin").digest("hex");
};

export const checkPassword = (password: string) => {
  const secret = getAdminPassword();
  return Boolean(secret) && same(password.trim(), secret!);
};

export const validSession = (token: string | undefined) => {
  const secret = getAdminPassword();
  return Boolean(token && secret && same(token, sessionToken()));
};

export async function isAdmin() {
  return validSession((await cookies()).get(ADMIN_COOKIE)?.value);
}
