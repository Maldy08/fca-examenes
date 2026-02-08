import crypto from "crypto";
import { cookies } from "next/headers";

const STUDENT_SESSION_COOKIE = "student_session";

function getSessionSecret() {
  return (
    process.env.STUDENT_COOKIE_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    "dev-insecure-secret-change-me"
  );
}

function signStudentId(studentId: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(studentId)
    .digest("hex");
}

function serializeSession(studentId: string) {
  const signature = signStudentId(studentId);
  return `${studentId}.${signature}`;
}

function deserializeSession(rawValue: string) {
  const [studentId, signature] = rawValue.split(".");

  if (!studentId || !signature) return null;

  const expectedSignature = signStudentId(studentId);
  const provided = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (provided.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(provided, expected)) return null;

  return studentId;
}

export async function setStudentSession(studentId: string) {
  const cookieStore = await cookies();

  cookieStore.set(STUDENT_SESSION_COOKIE, serializeSession(studentId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function getStudentIdFromSession() {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;

  if (!rawValue) return null;

  return deserializeSession(rawValue);
}

export async function clearStudentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_SESSION_COOKIE);
}
