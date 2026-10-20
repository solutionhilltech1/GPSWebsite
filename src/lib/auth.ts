import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Document } from "mongodb";
import { db } from "./mongo";

export const ADMIN_COOKIE = "gps_admin";

const DEFAULT_PASSWORD = "123";

// `_id` is a string in the admin collection, so type it (the default is ObjectId).
type AdminDoc = Document & { _id: string };
const admin = (database: Awaited<ReturnType<typeof db>>) => database.collection<AdminDoc>("admin");

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
export const sessionToken = async (customPwd?: string) =>
  createHmac("sha256", customPwd ?? (await getAdminPassword())).update("gps-admin").digest("hex");

export const checkPassword = async (password: string) => same(password.trim(), await getAdminPassword());

export const validSession = async (token: string | undefined) => Boolean(token) && same(token!, await sessionToken());

export async function isAdmin() {
  return validSession((await cookies()).get(ADMIN_COOKIE)?.value);
}

export const setAdminPassword = async (newPassword: string) => {
  const database = await db();
  await admin(database).updateOne(
    { _id: "password" },
    {
      $set: {
        value: newPassword.trim(),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
};

export interface AdminProfile {
  displayName: string;
  email: string;
  phone: string;
  department: string;
  notifyApplications: boolean;
  notifyInquiries: boolean;
  updatedAt?: string;
  passwordUpdatedAt?: string;
}

export const getAdminProfile = async (): Promise<AdminProfile> => {
  const database = await db();
  const [profileDoc, pwdDoc] = await Promise.all([
    admin(database).findOne({ _id: "profile" }),
    admin(database).findOne({ _id: "password" }),
  ]);

  return {
    displayName: String(profileDoc?.displayName || "HR Operations & Management"),
    email: String(profileDoc?.email || "connect@gpsprojects.co.in"),
    phone: String(profileDoc?.phone || "+91 95603 24929"),
    department: String(profileDoc?.department || "HR & People Operations"),
    notifyApplications: profileDoc?.notifyApplications ?? true,
    notifyInquiries: profileDoc?.notifyInquiries ?? true,
    updatedAt: profileDoc?.updatedAt ? new Date(profileDoc.updatedAt).toISOString() : undefined,
    passwordUpdatedAt: pwdDoc?.updatedAt ? new Date(pwdDoc.updatedAt).toISOString() : undefined,
  };
};

export const setAdminProfile = async (profile: Partial<AdminProfile>) => {
  const database = await db();
  await admin(database).updateOne(
    { _id: "profile" },
    {
      $set: {
        ...profile,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
};

