import "server-only";
import { LIFF_ID } from "./config";

// LIFF ID มีรูปแบบ "{channelId}-{xxxx}"
const LINE_CHANNEL_ID = process.env.LIFF_CHANNEL_ID || LIFF_ID.split("-")[0];

export type LineIdentity = {
  lineUserId: string;
  name: string | null;
  picture: string | null;
};

/** ตรวจ ID token กับ LINE (เช็ก signature, aud, exp ให้) — คืน null ถ้าไม่ผ่าน */
export async function verifyLineIdToken(idToken: string): Promise<LineIdentity | null> {
  if (typeof idToken !== "string" || !idToken) return null;

  const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      id_token: idToken,
      client_id: LINE_CHANNEL_ID
    }),
    cache: "no-store"
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (typeof data.sub !== "string") return null;

  // name / picture จะมีเมื่อ LIFF app เปิด scope "profile"
  return {
    lineUserId: data.sub,
    name: typeof data.name === "string" ? data.name : null,
    picture: typeof data.picture === "string" ? data.picture : null
  };
}
