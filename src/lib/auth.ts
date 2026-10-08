import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "gps_admin";

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

// ponytail: the session token is an HMAC of the password, so changing ADMIN_PASSWORD logs everyone out.
// Add a sessions collection if you ever need per-user logins or revocation.
export const sessionToken = () => createHmac("sha256", process.env.ADMIN_PASSWORD!).update("gps-admin").digest("hex");

export const checkPassword = (password: string) =>
  Boolean(process.env.ADMIN_PASSWORD) && same(password, process.env.ADMIN_PASSWORD!);

export const validSession = (token: string | undefined) =>
  Boolean(token && process.env.ADMIN_PASSWORD && same(token, sessionToken()));

export async function isAdmin() {
  return validSession((await cookies()).get(ADMIN_COOKIE)?.value);
}
