import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

/** registered = มี userId นี้ในตาราง users แล้ว */
export type Session = { userId: string; registered: boolean };

export const SESSION_COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 วัน

const secret = process.env.SESSION_SECRET;
if (!secret) throw new Error("Missing SESSION_SECRET");
const key = new TextEncoder().encode(secret);

/** ถอด JWT จาก cookie (ใช้ได้ทั้งใน proxy และ server) คืน null ถ้าไม่มีหรือไม่ถูกต้อง */
export async function decodeSession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string") return null;
    return { userId: payload.userId, registered: payload.registered === true };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  return decodeSession((await cookies()).get(SESSION_COOKIE)?.value);
}

/** เรียกได้เฉพาะใน Server Action / Route Handler */
export async function setSession(s: Session) {
  const token = await new SignJWT(s).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(key);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE
  });
}
