"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { createBooking, getRoomSchedule, updateBooking, type BookingInput } from "@/actions/booking";
import { useToast } from "@/providers/ToastProvider";
import { addDays, freeSlots, overlaps, timeOf, toInstant, todayStr } from "@/lib/datetime";
import { fullName } from "@/lib/format";
import { sendChatMessages } from "@/lib/liff";
import { bookingCard } from "@/lib/line-messages";
import type { Booking, BookingRules, Room } from "@/types/types";

type Props = {
  rooms: Room[];
  rules: BookingRules;
  initial: BookingInput;
  bookingId?: string; // มี = โหมดแก้ไข
};

/** รายการเวลาทุก 15 นาทีระหว่างเวลาเปิด-ปิด */
function timeOptions(from: string, to: string) {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const list: string[] = [];
  for (let m = toMin(from); m <= toMin(to); m += 15) {
    list.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return list;
}

export default function BookingForm({ rooms, rules, initial, bookingId }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<BookingInput>(initial);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  // ตารางของห้องในวันที่เลือก (โหลดใหม่เมื่อเปลี่ยนห้อง/วัน)
  const scheduleKey = `${form.roomId}|${form.date}`;
  const [schedule, setSchedule] = useState<{ key: string; bookings: Booking[] } | null>(null);
  const loadingSchedule = !!form.roomId && schedule?.key !== scheduleKey;

  useEffect(() => {
    if (!form.roomId || !form.date) return;
    let cancelled = false;
    getRoomSchedule(form.roomId, form.date).then((res) => {
      if (!cancelled) setSchedule({ key: `${form.roomId}|${form.date}`, bookings: res.ok ? res.data : [] });
    });
    return () => {
      cancelled = true;
    };
  }, [form.roomId, form.date]);

  const room = rooms.find((r) => r.roomId === form.roomId);
  const others = useMemo(
    () => (schedule?.key === scheduleKey ? schedule.bookings.filter((b) => b.bookingId !== bookingId) : []),
    [schedule, scheduleKey, bookingId]
  );
  const slots = useMemo(() => freeSlots(others, form.date, rules.openTime, rules.closeTime), [others, form.date, rules]);

  const allTimes = timeOptions(rules.openTime, rules.closeTime);
  const startTimes = allTimes.slice(0, -1);
  const endTimes = allTimes.filter((t) => t > form.startTime);

  // เตือนทันทีถ้าเวลาที่เลือกทับคนอื่น (server เช็กซ้ำอีกรอบตอนบันทึก)
  const conflict = others.find((b) => overlaps(toInstant(form.date, form.startTime), toInstant(form.date, form.endTime), b.startAt, b.endAt));

  const set = <K extends keyof BookingInput>(key: K, value: BookingInput[K]) => {
    setError("");
    setForm((f) => {
      const next = { ...f, [key]: value };
      // เลื่อนเวลาเริ่มจนเลยเวลาจบ → ขยับเวลาจบตาม
      if (key === "startTime" && next.endTime <= next.startTime) {
        next.endTime = allTimes.find((t) => t > next.startTime) ?? next.startTime;
      }
      return next;
    });
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (conflict) return;

    startTransition(async () => {
      const res = bookingId ? await updateBooking(bookingId, form) : await createBooking(form);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.push(bookingId ? "บันทึกการแก้ไขแล้ว" : "จองห้องสำเร็จ");
      const id = bookingId ?? (res.data as { bookingId: string }).bookingId;

      // ส่งการ์ดสรุปเข้าแชท OA (ส่งไม่ได้ก็ไม่เป็นไร การจองบันทึกแล้ว)
      await sendChatMessages([
        bookingCard(bookingId ? "updated" : "created", {
          bookingId: id,
          title: form.title.trim(),
          roomName: room?.name ?? "-",
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime
        })
      ]);

      router.replace(`/book/${id}`);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="card p-4 space-y-4">
        <div>
          <label className="label" htmlFor="roomId">
            ห้องประชุม
          </label>
          <select id="roomId" className="input" value={form.roomId} onChange={(e) => set("roomId", e.target.value)} required>
            <option value="">-- เลือกห้อง --</option>
            {rooms.map((r) => (
              <option key={r.roomId} value={r.roomId}>
                {r.name} ({r.location ?? "-"}, {r.capacity} ที่นั่ง)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="date">
            วันที่
          </label>
          <input
            id="date"
            type="date"
            className="input"
            value={form.date}
            min={todayStr()}
            max={addDays(todayStr(), rules.maxDaysAhead)}
            onChange={(e) => set("date", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="startTime">
              เริ่ม
            </label>
            <select id="startTime" className="input" value={form.startTime} onChange={(e) => set("startTime", e.target.value)}>
              {startTimes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="endTime">
              สิ้นสุด
            </label>
            <select id="endTime" className="input" value={form.endTime} onChange={(e) => set("endTime", e.target.value)}>
              {endTimes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {form.roomId && (
          <div className="rounded-xl bg-gray-50 p-3 space-y-2">
            <div className="text-xs font-medium text-gray-600">{loadingSchedule ? "กำลังโหลดตารางห้อง..." : "ช่วงว่าง (แตะเพื่อเลือก)"}</div>
            {!loadingSchedule && (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {slots.length === 0 && <span className="text-xs text-gray-400">ไม่มีช่วงว่าง</span>}
                  {slots.map((s) => (
                    <button
                      key={s.start}
                      type="button"
                      onClick={() => {
                        setError("");
                        setForm((f) => ({ ...f, startTime: s.start, endTime: s.end }));
                      }}
                      className="text-xs px-2.5 py-1 rounded-full border border-emerald-200 bg-white text-emerald-700"
                    >
                      {s.start}-{s.end}
                    </button>
                  ))}
                </div>
                {others.length > 0 && (
                  <ul className="text-xs text-gray-500 space-y-0.5 pt-1 border-t border-gray-200">
                    {others.map((b) => (
                      <li key={b.bookingId} className={clsx(conflict?.bookingId === b.bookingId && "text-red-600 font-medium")}>
                        ไม่ว่าง {timeOf(b.startAt)}-{timeOf(b.endAt)} • {b.title ?? "-"} ({fullName(b.user)})
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}

        {conflict && (
          <div className="text-sm text-red-600">
            ⚠️ เวลาทับกับ &quot;{conflict.title ?? "-"}&quot; {timeOf(conflict.startAt)}-{timeOf(conflict.endAt)} น.
          </div>
        )}
      </div>

      <div className="card p-4 space-y-4">
        <div>
          <label className="label" htmlFor="title">
            หัวข้อการประชุม
          </label>
          <input
            id="title"
            className="input"
            value={form.title}
            maxLength={200}
            onChange={(e) => set("title", e.target.value)}
            placeholder="เช่น ประชุมทีมประจำสัปดาห์"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="attendees">
            จำนวนผู้เข้าร่วม {room && room.capacity > 0 && <span className="text-gray-400 font-normal">(สูงสุด {room.capacity})</span>}
          </label>
          <input
            id="attendees"
            type="number"
            inputMode="numeric"
            className="input"
            min={1}
            max={room?.capacity || undefined}
            value={form.attendees || ""}
            onChange={(e) => set("attendees", Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="notes">
            หมายเหตุ <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
          </label>
          <textarea id="notes" className="input" rows={3} maxLength={1000} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}

      <div className="flex gap-2">
        <button type="button" className="btn btn-outline flex-1" onClick={() => router.back()} disabled={pending}>
          ยกเลิก
        </button>
        <button type="submit" className="btn btn-primary flex-2" disabled={pending || !!conflict || loadingSchedule}>
          {pending ? "กำลังบันทึก..." : bookingId ? "บันทึกการแก้ไข" : "ยืนยันการจอง"}
        </button>
      </div>
    </form>
  );
}
