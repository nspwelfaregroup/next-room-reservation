// ใช้ได้ทั้ง server และ client — ทุกอย่างคิดตามเวลาไทย (UTC+7, ไม่มี daylight saving)
// server (เช่น Vercel) มักรันเป็น UTC จึงห้ามใช้ new Date().getDate() ตรงๆ

export const TZ = "Asia/Bangkok";
const OFFSET = "+07:00";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isDateStr(s: unknown): s is string {
  return typeof s === "string" && DATE_RE.test(s) && !Number.isNaN(new Date(`${s}T00:00:00${OFFSET}`).getTime());
}

export function isTimeStr(s: unknown): s is string {
  return typeof s === "string" && TIME_RE.test(s);
}

/** "YYYY-MM-DD" ของวันนี้ (หรือของเวลาที่ส่งมา) ตามเวลาไทย */
export function todayStr(at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

/** วัน + เวลาไทย → Date */
export function toInstant(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${OFFSET}`);
}

/** ช่วงเวลาของทั้งวัน (ISO) ใช้ query การจองที่ทับวันนั้น */
export function dayRange(date: string): { start: string; end: string } {
  const start = toInstant(date, "00:00");
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** ISO → "YYYY-MM-DD" ตามเวลาไทย */
export function dateOf(iso: string): string {
  return todayStr(new Date(iso));
}

/** ISO → "HH:mm" ตามเวลาไทย */
export function timeOf(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
}

/** "YYYY-MM-DD" → "อา. 27 ก.ย. 69" */
export function fmtDate(date: string): string {
  return new Intl.DateTimeFormat("th-TH", { timeZone: TZ, weekday: "short", day: "numeric", month: "short", year: "2-digit" }).format(
    toInstant(date, "12:00")
  );
}

/** ISO → { day: "27", month: "ก.ย." } สำหรับกล่องวันที่ในการ์ด */
export function dayMonthOf(iso: string): { day: string; month: string } {
  const d = new Date(iso);
  return {
    day: new Intl.DateTimeFormat("th-TH", { timeZone: TZ, day: "numeric" }).format(d),
    month: new Intl.DateTimeFormat("th-TH", { timeZone: TZ, month: "short" }).format(d)
  };
}

/** ช่วงเวลาสองช่วงทับกันไหม (ปลายเปิด: 09:00-10:00 กับ 10:00-11:00 ไม่ทับ) */
export function overlaps(aStart: string | Date, aEnd: string | Date, bStart: string | Date, bEnd: string | Date): boolean {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
}

/**
 * หาช่วงว่างของห้องในวันหนึ่ง ภายในเวลาเปิด-ปิด
 * ถ้าเป็นวันนี้จะตัดเวลาที่ผ่านไปแล้วออก (ปัดขึ้นเป็นช่วง 15 นาที)
 */
export function freeSlots(
  bookings: { startAt: string; endAt: string }[],
  date: string,
  openTime: string,
  closeTime: string,
  now: Date = new Date()
): { start: string; end: string }[] {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const minOfIso = (iso: string) => {
    if (dateOf(iso) < date) return 0;
    if (dateOf(iso) > date) return 24 * 60;
    return toMin(timeOf(iso));
  };

  let cursor = toMin(openTime);
  const close = toMin(closeTime);

  const today = todayStr(now);
  if (date < today) return [];
  if (date === today) cursor = Math.max(cursor, Math.ceil(toMin(timeOf(now.toISOString())) / 15) * 15);

  const busy = bookings.map((b) => [minOfIso(b.startAt), minOfIso(b.endAt)] as const).sort((a, b) => a[0] - b[0]);

  const slots: { start: string; end: string }[] = [];
  for (const [s, e] of busy) {
    if (s > cursor && cursor < close) slots.push({ start: toTime(cursor), end: toTime(Math.min(s, close)) });
    cursor = Math.max(cursor, e);
  }
  if (cursor < close) slots.push({ start: toTime(cursor), end: toTime(close) });

  return slots.filter((s) => toMin(s.end) - toMin(s.start) >= 15);
}
