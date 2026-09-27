import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import { supabaseAdmin } from "@/utils/supabase/admin";
import type { User } from "@/types/types";

const USER_COLUMNS = "userId, displayName, firstName, lastName, department, pictureUrl, registeredAt, dept:departments(name)";

type UserRow = Omit<User, "departmentName"> & { dept: { name: string } | null };

function toUser({ dept, ...row }: UserRow): User {
  return { ...row, departmentName: dept?.name ?? null };
}

/** หา user ในตาราง users — throw ถ้า query error, คืน null ถ้าไม่เจอ */
export async function findUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from("users").select(USER_COLUMNS).eq("userId", userId).maybeSingle();
  if (error) throw error;
  return data ? toUser(data as unknown as UserRow) : null;
}

/** user ที่ลงทะเบียนแล้วจาก session cookie (ถ้ายังไม่ลงทะเบียนคืน null) */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();
  if (!session?.registered) return null;
  try {
    return await findUserById(session.userId);
  } catch (error) {
    console.error(error);
    return null;
  }
});

/** ใช้ในหน้าที่ต้องการข้อมูล user เต็ม (ชื่อ แผนก) — query DB 1 ครั้ง */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

/**
 * ใช้ในหน้าที่ต้องการแค่ userId — อ่านจาก JWT ใน cookie อย่างเดียว ไม่แตะ DB จึงเร็วกว่า
 * (หน้าแสดงผลใช้ได้ ส่วน Server Action ที่เขียนข้อมูลยังใช้ getCurrentUser() ตรวจกับ DB)
 */
export async function requireSession(): Promise<{ userId: string }> {
  const session = await getSession();
  if (!session?.registered) redirect("/");
  return { userId: session.userId };
}
