import "server-only";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { dayRange } from "./datetime";
import type { Booking, BookingRules, Department, Room } from "@/types/types";

// ไฟล์นี้คือ Data Access Layer: รวม query อ่านข้อมูลทั้งหมดไว้ที่เดียว (ฝั่ง server เท่านั้น)

const BOOKING_SELECT =
  "bookingId, roomId, userId, title, attendees, notes, startAt, endAt, status, createdAt, updatedAt, " +
  "room:rooms(roomId, name, location), user:users(displayName, firstName, lastName, pictureUrl)";

const ROOM_SELECT = "roomId, name, capacity, location, active, createdAt";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: unknown): s is string => typeof s === "string" && UUID_RE.test(s);

const DEFAULT_RULES: BookingRules = { openTime: "07:00", closeTime: "20:00", maxDaysAhead: 60 };

/* ---------- master data ---------- */

export async function getDepartments(): Promise<Department[]> {
  const { data, error } = await supabaseAdmin.from("departments").select("id, name").order("name");
  if (error) throw error;
  return data;
}

export async function getRooms(): Promise<Room[]> {
  const { data, error } = await supabaseAdmin.from("rooms").select(ROOM_SELECT).eq("active", true).order("name");
  if (error) throw error;
  return data;
}

export async function getRoom(roomId: string): Promise<Room | null> {
  if (!isUuid(roomId)) return null;
  const { data, error } = await supabaseAdmin.from("rooms").select(ROOM_SELECT).eq("roomId", roomId).maybeSingle();
  if (error) throw error;
  return data;
}

/** อ่านเฉพาะ key ที่เป็นกติกาการจอง (ตาราง config มี token ลับอยู่ ห้าม select ทั้งตาราง) */
export async function getBookingRules(): Promise<BookingRules> {
  const { data, error } = await supabaseAdmin
    .from("config")
    .select("key, value")
    .in("key", ["BOOKING_OPEN_TIME", "BOOKING_CLOSE_TIME", "BOOKING_MAX_DAYS_AHEAD"]);
  if (error) throw error;

  const map = new Map(data.map((r) => [r.key, r.value]));
  const time = (v: string | undefined, fallback: string) => (v && /^\d{2}:\d{2}$/.test(v) ? v : fallback);
  const days = Number(map.get("BOOKING_MAX_DAYS_AHEAD"));

  return {
    openTime: time(map.get("BOOKING_OPEN_TIME"), DEFAULT_RULES.openTime),
    closeTime: time(map.get("BOOKING_CLOSE_TIME"), DEFAULT_RULES.closeTime),
    maxDaysAhead: Number.isInteger(days) && days > 0 ? days : DEFAULT_RULES.maxDaysAhead
  };
}

/* ---------- bookings ---------- */

const asBookings = (data: unknown) => data as Booking[];

export async function getBooking(bookingId: string): Promise<Booking | null> {
  if (!isUuid(bookingId)) return null;
  const { data, error } = await supabaseAdmin.from("bookings").select(BOOKING_SELECT).eq("bookingId", bookingId).maybeSingle();
  if (error) throw error;
  return data as unknown as Booking | null;
}

/** การจองที่ยัง ACTIVE และทับช่วงเวลา [from, to) — ถ้าไม่ส่ง roomId จะเอาทุกห้อง */
export async function getActiveBookingsBetween(from: string, to: string, roomId?: string): Promise<Booking[]> {
  let query = supabaseAdmin
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("status", "ACTIVE")
    .lt("startAt", to)
    .gt("endAt", from)
    .order("startAt");
  if (roomId) query = query.eq("roomId", roomId);

  const { data, error } = await query;
  if (error) throw error;
  return asBookings(data);
}

export function getBookingsOnDate(date: string, roomId?: string) {
  const { start, end } = dayRange(date);
  return getActiveBookingsBetween(start, end, roomId);
}

export type MineTab = "upcoming" | "past" | "cancelled";

export async function getMyBookings(userId: string, tab: MineTab, limit = 50): Promise<Booking[]> {
  const now = new Date().toISOString();
  let query = supabaseAdmin.from("bookings").select(BOOKING_SELECT).eq("userId", userId).limit(limit);

  if (tab === "upcoming") query = query.eq("status", "ACTIVE").gt("endAt", now).order("startAt");
  else if (tab === "past") query = query.eq("status", "ACTIVE").lte("endAt", now).order("startAt", { ascending: false });
  else query = query.eq("status", "CANCELLED").order("startAt", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return asBookings(data);
}
