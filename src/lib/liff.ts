// Library
import liff from "@line/liff";
import { withTimeout } from "./async";

let initPromise: Promise<void> | null = null;

const INIT_TIMEOUT_MS = 15_000;

export function initLiff(liffId: string): Promise<void> {
  if (!initPromise) {
    // ถ้า liff.init กำลังพาไปหน้า login / liff.state หน้าจะเปลี่ยนเองก่อนหมดเวลา
    initPromise = withTimeout(
      liff.init({ liffId, withLoginOnExternalBrowser: true }),
      INIT_TIMEOUT_MS,
      "เชื่อมต่อ LINE ไม่สำเร็จ (หมดเวลา) กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่"
    ).catch((error) => {
      initPromise = null; // ให้กดลองใหม่ได้
      throw error;
    });
  }
  return initPromise;
}

/** LINE userId จาก ID token ที่ LIFF ถืออยู่ (ไม่ต้องยิง server) */
export function getLiffUserId(): string | null {
  return liff.getDecodedIDToken()?.sub ?? null;
}

/** คืน ID token ที่ยังไม่หมดอายุ หรือ null ถ้ากำลัง redirect ไป login */
export function getIDTokenLiff(): string | null {
  if (!liff.isLoggedIn()) {
    // ใน LINE app ใช้ liff.login() ไม่ได้ ถ้าปล่อยไว้หน้าจะค้าง → แจ้ง error แทน
    if (liff.isInClient()) throw new Error("ไม่พบการเข้าสู่ระบบ LINE กรุณาปิดแล้วเปิดใหม่อีกครั้ง");
    liff.login();
    return null;
  }

  const decoded = liff.getDecodedIDToken();
  if (!decoded?.exp || decoded.exp * 1000 <= Date.now()) {
    // ใน LINE app ใช้ liff.login() ไม่ได้ ต้องให้ผู้ใช้เปิดใหม่
    if (liff.isInClient()) throw new Error("เซสชัน LINE หมดอายุ กรุณาปิดแล้วเปิดใหม่อีกครั้ง");
    liff.logout();
    liff.login();
    return null;
  }

  return liff.getIDToken();
}

export async function getLineProfile() {
  if (!liff.isLoggedIn()) liff.login();
  const p = await liff.getProfile();
  return {
    userId: p.userId,
    displayName: p.displayName,
    pictureUrl: p.pictureUrl || ""
  };
}

export type SendResult = "sent" | "unavailable" | "no-permission" | "failed";

/**
 * ส่งข้อความเข้าห้องแชทที่เปิด LIFF มา (ในนามผู้ใช้ ไม่นับโควตา Messaging API)
 * ใช้ได้เมื่อเปิดใน LINE app จากห้องแชท เช่น Rich Menu ของ OA และ LIFF app เปิด scope chat_message.write
 * ไม่ throw — การส่งข้อความเป็นแค่ส่วนเสริม ห้ามทำให้ flow หลักพัง
 */
export async function sendChatMessages(messages: Parameters<typeof liff.sendMessages>[0]): Promise<SendResult> {
  try {
    const type = liff.getContext()?.type;
    if (!liff.isInClient() || (type !== "utou" && type !== "group" && type !== "room")) return "unavailable";

    const permission = await liff.permission.query("chat_message.write");
    if (permission.state !== "granted") return "no-permission";

    await liff.sendMessages(messages);
    return "sent";
  } catch (error) {
    console.error("liff.sendMessages failed", error);
    return "failed";
  }
}

export type ShareResult = "sent" | "cancelled" | "unavailable" | "failed";

/**
 * เปิดหน้าเลือกเพื่อน/กลุ่มของ LINE แล้วส่งข้อความในนามผู้ใช้ (ไม่นับโควตา Messaging API)
 * ต้องเปิด shareTargetPicker ใน LINE Developers Console → LIFF app ก่อน
 */
export async function shareMessages(messages: Parameters<typeof liff.shareTargetPicker>[0]): Promise<ShareResult> {
  try {
    if (!liff.isApiAvailable("shareTargetPicker")) return "unavailable";
    const res = await liff.shareTargetPicker(messages, { isMultiple: true });
    return res ? "sent" : "cancelled"; // null = ผู้ใช้กดปิดหน้าเลือกเอง
  } catch (error) {
    console.error("liff.shareTargetPicker failed", error);
    return "failed";
  }
}

export function closeLiff() {
  try {
    if (liff.isInClient()) liff.closeWindow();
  } catch (error) {
    window.close();
    console.log(error);
  }
}

export { liff };
