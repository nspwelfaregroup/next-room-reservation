"use server";

import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getActiveBookingsBetween, getBooking, getBookingRules, getBookingsOnDate, getRoom, isUuid } from "@/lib/data";
import { addDays, isDateStr, isTimeStr, timeOf, toInstant, todayStr } from "@/lib/datetime";
import { fullName } from "@/lib/format";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { text } from "./validate";
import type { ActionResult, Booking, User } from "@/types/types";

export type BookingInput = {
  roomId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  title: string;
  attendees: number;
  notes: string;
};

type BookingRow = {
  roomId: string;
  title: string;
  attendees: number;
  notes: string | null;
  startAt: string;
  endAt: string;
};

const EXCLUSION_VIOLATION = "23P01"; // จาก constraint bookings_no_overlap ใน DB

function conflictMessage(b: Booking) {
  return `ช่วงเวลานี้ถูกจองแล้ว: "${b.title ?? "-"}" ${timeOf(b.startAt)}-${timeOf(b.endAt)} น. โดย ${fullName(b.user)}`;
}

/** ตรวจข้อมูลการจองทั้งหมดฝั่ง server — excludeBookingId ใช้ตอนแก้ไข (ไม่นับตัวเอง) */
async function validateBooking(input: BookingInput, excludeBookingId?: string): Promise<ActionResult<BookingRow>> {
  const { roomId, date, startTime, endTime } = input ?? {};
  if (!isUuid(roomId)) return { ok: false, error: "กรุณาเลือกห้อง" };
  if (!isDateStr(date)) return { ok: false, error: "วันที่ไม่ถูกต้อง" };
  if (!isTimeStr(startTime) || !isTimeStr(endTime)) return { ok: false, error: "เวลาไม่ถูกต้อง" };
  if (endTime <= startTime) return { ok: false, error: "เวลาสิ้นสุดต้องหลังเวลาเริ่ม" };

  const [room, rules] = await Promise.all([getRoom(roomId), getBookingRules()]);
  if (!room || !room.active) return { ok: false, error: "ไม่พบห้องนี้ หรือห้องปิดให้บริการ" };

  if (startTime < rules.openTime || endTime > rules.closeTime) {
    return { ok: false, error: `จองได้ในช่วง ${rules.openTime}-${rules.closeTime} น. เท่านั้น` };
  }
  if (date > addDays(todayStr(), rules.maxDaysAhead)) {
    return { ok: false, error: `จองล่วงหน้าได้ไม่เกิน ${rules.maxDaysAhead} วัน` };
  }

  const startAt = toInstant(date, startTime);
  const endAt = toInstant(date, endTime);
  if (startAt <= new Date()) return { ok: false, error: "ไม่สามารถจองเวลาที่ผ่านไปแล้ว" };

  const title = text(input.title, 200);
  if (!title) return { ok: false, error: "กรุณากรอกหัวข้อการประชุม" };

  const attendees = Number(input.attendees);
  if (!Number.isInteger(attendees) || attendees < 1) return { ok: false, error: "จำนวนผู้เข้าร่วมต้องอย่างน้อย 1 คน" };
  if (room.capacity > 0 && attendees > room.capacity) {
    return { ok: false, error: `ห้องนี้รองรับได้ไม่เกิน ${room.capacity} คน` };
  }

  // เช็กเวลาทับ (DB มี constraint กันอีกชั้นกรณีกดจองพร้อมกัน)
  const conflicts = (await getActiveBookingsBetween(startAt.toISOString(), endAt.toISOString(), roomId)).filter(
    (b) => b.bookingId !== excludeBookingId
  );
  if (conflicts.length > 0) return { ok: false, error: conflictMessage(conflicts[0]) };

  return {
    ok: true,
    data: {
      roomId,
      title,
      attendees,
      notes: text(input.notes, 1000) || null,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString()
    }
  };
}

/** โหลดการจองและเช็กว่าเป็นของ user คนนี้ */
async function getOwnBooking(bookingId: string, me: User): Promise<ActionResult<Booking>> {
  const booking = await getBooking(bookingId);
  if (!booking) return { ok: false, error: "ไม่พบการจองนี้" };
  if (booking.userId !== me.userId) return { ok: false, error: "คุณไม่ใช่เจ้าของการจองนี้" };
  if (booking.status !== "ACTIVE") return { ok: false, error: "การจองนี้ถูกยกเลิกไปแล้ว" };
  return { ok: true, data: booking };
}

function dbError(error: { code?: string }): ActionResult<never> {
  if (error.code === EXCLUSION_VIOLATION) return { ok: false, error: "ช่วงเวลานี้เพิ่งถูกจองไป กรุณาเลือกเวลาอื่น" };
  console.error(error);
  return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
}

export async function createBooking(input: BookingInput): Promise<ActionResult<{ bookingId: string }>> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "กรุณาเข้าสู่ระบบใหม่" };

  const valid = await validateBooking(input);
  if (!valid.ok) return valid;

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .insert({ ...valid.data, userId: me.userId, status: "ACTIVE", createdAt: now, updatedAt: now })
    .select("bookingId")
    .single();
  if (error) return dbError(error);

  refresh();
  return { ok: true, data: { bookingId: data.bookingId } };
}

export async function updateBooking(bookingId: string, input: BookingInput): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "กรุณาเข้าสู่ระบบใหม่" };

  const own = await getOwnBooking(bookingId, me);
  if (!own.ok) return own;
  if (new Date(own.data.startAt) <= new Date()) return { ok: false, error: "การประชุมเริ่มไปแล้ว แก้ไขไม่ได้" };

  const valid = await validateBooking(input, bookingId);
  if (!valid.ok) return valid;

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ ...valid.data, updatedAt: new Date().toISOString() })
    .eq("bookingId", bookingId)
    .eq("userId", me.userId);
  if (error) return dbError(error);

  refresh();
  return { ok: true, data: null };
}

export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "กรุณาเข้าสู่ระบบใหม่" };

  const own = await getOwnBooking(bookingId, me);
  if (!own.ok) return own;
  if (new Date(own.data.endAt) <= new Date()) return { ok: false, error: "การประชุมจบไปแล้ว ยกเลิกไม่ได้" };

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ status: "CANCELLED", updatedAt: new Date().toISOString() })
    .eq("bookingId", bookingId)
    .eq("userId", me.userId);
  if (error) return dbError(error);

  refresh();
  return { ok: true, data: null };
}

/** ตารางการจองของห้องในวันหนึ่ง — ให้ฟอร์มจองเรียกดูช่วงว่างแบบ real-time */
export async function getRoomSchedule(roomId: string, date: string): Promise<ActionResult<Booking[]>> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "กรุณาเข้าสู่ระบบใหม่" };
  if (!isUuid(roomId) || !isDateStr(date)) return { ok: false, error: "ข้อมูลไม่ถูกต้อง" };

  try {
    return { ok: true, data: await getBookingsOnDate(date, roomId) };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "โหลดตารางห้องไม่สำเร็จ" };
  }
}
