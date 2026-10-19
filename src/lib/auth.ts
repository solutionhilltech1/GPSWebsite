import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./mongo";

export const ADMIN_COOKIE = "gps_admin";

const DEFAULT_PASSWORD = "123";

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

// Passcode lives in Mongo: `admin` collection, doc { _id: "password", value }. Seeded with "123" on first use;
// edit `value` in the database to change it. ponytail: stored as plain text, hash it if the DB is ever shared.
const getAdminPassword = async () => {
  const doc = await (await db())
    .collection<{ _id: string; value: string }>("admin")
    .findOneAndUpdate({ _id: "password" }, { $setOnInsert: { value: DEFAULT_PASSWORD } }, { upsert: true, returnDocument: "after" });
  return String(doc?.value ?? DEFAULT_PASSWORD).trim();
};

// session token is an HMAC of the password, so changing it in the database logs everyone out.
export const sessionToken = async () => createHmac("sha256", await getAdminPassword()).update("gps-admin").digest("hex");

export const checkPassword = async (password: string) => same(password.trim(), await getAdminPassword());

export const validSession = async (token: string | undefined) => Boolean(token) && same(token!, await sessionToken());

export async function isAdmin() {
  return validSession((await cookies()).get(ADMIN_COOKIE)?.value);
}
