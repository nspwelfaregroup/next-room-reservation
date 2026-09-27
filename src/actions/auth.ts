"use server";

import { refresh } from "next/cache";
import { verifyLineIdToken } from "@/lib/line";
import { setSession } from "@/lib/session";
import { findUserById } from "@/lib/auth";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { validateProfile, type ProfileInput } from "./validate";
import type { ActionResult, User } from "@/types/types";

export type LoginResult = { status: "ok"; user: User } | { status: "unregistered" } | { status: "invalid" } | { status: "error" };

/** ตรวจ ID token → หา user ใน Supabase → เก็บ session (JWT) ลง cookie ทั้งกรณีเจอและไม่เจอ */
export async function loginWithLine(idToken: string): Promise<LoginResult> {
  try {
    const line = await verifyLineIdToken(idToken);
    if (!line) return { status: "invalid" };

    let user = await findUserById(line.lineUserId);
    await setSession({ userId: line.lineUserId, registered: !!user });

    // อัปเดตชื่อ/รูป LINE ให้เป็นปัจจุบัน (ผู้ใช้เปลี่ยนรูปใน LINE บ่อย)
    if (user && ((line.name && line.name !== user.displayName) || (line.picture && line.picture !== user.pictureUrl))) {
      const patch = { displayName: line.name ?? user.displayName, pictureUrl: line.picture ?? user.pictureUrl };
      const { error } = await supabaseAdmin.from("users").update(patch).eq("userId", user.userId);
      if (!error) user = { ...user, ...patch };
    }

    refresh(); // ให้ Server Component (เช่นหน้าแรก) render ใหม่ด้วย cookie ใหม่
    return user ? { status: "ok", user } : { status: "unregistered" };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
}

/** ลงทะเบียนผู้ใช้ใหม่ — ใช้ ID token ยืนยันตัวตนอีกครั้ง และเอาชื่อ/รูปจาก LINE */
export async function registerUser(idToken: string, input: ProfileInput): Promise<ActionResult<User>> {
  try {
    const line = await verifyLineIdToken(idToken);
    if (!line) return { ok: false, error: "ไม่สามารถยืนยันตัวตนกับ LINE ได้ กรุณาเปิดแอปใหม่" };

    const profile = await validateProfile(input);
    if (!profile.ok) return profile;

    const existing = await findUserById(line.lineUserId);
    if (!existing) {
      const { error } = await supabaseAdmin.from("users").insert({
        userId: line.lineUserId,
        displayName: line.name ?? profile.data.firstName,
        pictureUrl: line.picture,
        ...profile.data
      });
      if (error) throw error;
    }

    const user = await findUserById(line.lineUserId);
    if (!user) throw new Error("insert user failed");

    await setSession({ userId: user.userId, registered: true });
    refresh();
    return { ok: true, data: user };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่" };
  }
}
