"use server";

import { refresh } from "next/cache";
import { findUserById, getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { validateProfile, type ProfileInput } from "./validate";
import type { ActionResult, User } from "@/types/types";

/** แก้ไขชื่อ นามสกุล แผนก ของตัวเอง */
export async function updateProfile(input: ProfileInput): Promise<ActionResult<User>> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "กรุณาเข้าสู่ระบบใหม่" };

  const profile = await validateProfile(input);
  if (!profile.ok) return profile;

  const { error } = await supabaseAdmin.from("users").update(profile.data).eq("userId", me.userId);
  if (error) {
    console.error(error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }

  const user = await findUserById(me.userId);
  refresh();
  return user ? { ok: true, data: user } : { ok: false, error: "ไม่พบผู้ใช้" };
}
