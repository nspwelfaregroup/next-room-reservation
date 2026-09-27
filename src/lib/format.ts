/** ชื่อที่ใช้แสดง: ชื่อ-นามสกุล ถ้าไม่มีใช้ชื่อ LINE */
export function fullName(u: { firstName?: string | null; lastName?: string | null; displayName?: string | null } | null | undefined): string {
  if (!u) return "-";
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ");
  return name || u.displayName || "-";
}
