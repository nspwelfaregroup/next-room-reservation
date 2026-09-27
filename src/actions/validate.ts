import "server-only";
import { getDepartments } from "@/lib/data";
import type { ActionResult } from "@/types/types";

// ข้อมูลที่ส่งเข้า Server Action มาจาก browser = เชื่อไม่ได้ ต้องตรวจทุกครั้ง

export type ProfileInput = {
  firstName: string;
  lastName: string;
  department: string;
};

export const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function validateProfile(input: ProfileInput): Promise<ActionResult<ProfileInput>> {
  const firstName = text(input?.firstName, 100);
  const lastName = text(input?.lastName, 100);
  const department = text(input?.department, 50);

  if (!firstName) return { ok: false, error: "กรุณากรอกชื่อ" };
  if (!lastName) return { ok: false, error: "กรุณากรอกนามสกุล" };

  const departments = await getDepartments();
  if (!departments.some((d) => d.id === department)) return { ok: false, error: "กรุณาเลือกแผนก" };

  return { ok: true, data: { firstName, lastName, department } };
}
