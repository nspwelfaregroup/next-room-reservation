"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { quickBook } from "@/actions/booking";
import { QUICK_DURATIONS } from "@/lib/constants";
import { minToTime, minuteOfDay, timeToMin, todayStr } from "@/lib/datetime";
import { sendChatMessages } from "@/lib/liff";
import { bookingCard } from "@/lib/line-messages";
import { useToast } from "@/providers/ToastProvider";
import type { BookingRules, Room } from "@/types/types";

type Props = {
  rooms: Room[];
  bookings: { roomId: string; startAt: string; endAt: string }[];
  rules: BookingRules;
  serverNow: string; // ใช้เวลาจาก server ตอน render ครั้งแรก กัน hydration mismatch
};

type Availability =
  | { status: "free"; start: string; end: string; shortened: boolean }
  | { status: "busy"; until: string }
  | { status: "short"; until: string };

export default function QuickBook({ rooms, bookings, rules, serverNow }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [now, setNow] = useState(() => new Date(serverNow));
  const [duration, setDuration] = useState<number>(60);
  const [title, setTitle] = useState("ประชุมด่วน");
  const [bookingRoom, setBookingRoom] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // อัปเดตเวลาทุก 30 วินาที ให้สถานะว่าง/ไม่ว่างเป็นปัจจุบัน
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const date = todayStr(now);
  const startMin = Math.floor(minuteOfDay(now, date) / 5) * 5;
  const openMin = timeToMin(rules.openTime);
  const closeMin = timeToMin(rules.closeTime);
  const outOfHours = startMin < openMin || startMin + 15 > closeMin;

  const availability = useMemo(() => {
    const map = new Map<string, Availability>();
    for (const room of rooms) {
      const list = bookings
        .filter((b) => b.roomId === room.roomId)
        .map((b) => ({ s: minuteOfDay(b.startAt, date), e: minuteOfDay(b.endAt, date) }));

      const current = list.find((b) => b.s <= startMin && startMin < b.e);
      if (current) {
        map.set(room.roomId, { status: "busy", until: minToTime(current.e) });
        continue;
      }

      const nextStart = Math.min(closeMin, ...list.filter((b) => b.s > startMin).map((b) => b.s));
      const endMin = Math.min(startMin + duration, nextStart);
      map.set(
        room.roomId,
        endMin - startMin < 15
          ? { status: "short", until: minToTime(nextStart) }
          : { status: "free", start: minToTime(startMin), end: minToTime(endMin), shortened: endMin < startMin + duration }
      );
    }
    return map;
  }, [rooms, bookings, date, startMin, closeMin, duration]);

  // ห้องว่างขึ้นก่อน
  const sorted = [...rooms].sort((a, b) => Number(availability.get(b.roomId)?.status === "free") - Number(availability.get(a.roomId)?.status === "free"));

  function book(room: Room) {
    setBookingRoom(room.roomId);
    startTransition(async () => {
      const res = await quickBook(room.roomId, duration, title);
      if (!res.ok) {
        toast.push(res.error, "err");
        setBookingRoom(null);
        router.refresh(); // ข้อมูลอาจเก่า โหลดสถานะห้องใหม่
        return;
      }
      toast.push(`จอง ${room.name} ${res.data.startTime}-${res.data.endTime} แล้ว`);
      await sendChatMessages([
        bookingCard("created", { ...res.data, title: title.trim() || "ประชุมด่วน", roomName: room.name })
      ]);
      router.replace(`/book/${res.data.bookingId}`);
    });
  }

  if (outOfHours) {
    return (
      <div className="card p-6 text-center text-sm text-gray-500 space-y-1">
        <div className="text-3xl">🌙</div>
        <div>ตอนนี้อยู่นอกเวลาให้บริการ</div>
        <div>
          จองได้ในช่วง {rules.openTime}-{rules.closeTime} น.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 space-y-3">
        <div>
          <div className="label">ใช้ห้องนาน</div>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_DURATIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDuration(m)}
                className={clsx(
                  "py-2 rounded-xl text-sm border transition",
                  duration === m ? "bg-amber-500 border-amber-500 text-white font-medium" : "bg-white border-gray-200 text-gray-600"
                )}
              >
                {m < 60 ? `${m} นาที` : `${m / 60} ชม.`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="quick-title">
            หัวข้อ
          </label>
          <input id="quick-title" className="input" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((room) => {
          const a = availability.get(room.roomId)!;
          const loading = pending && bookingRoom === room.roomId;
          return (
            <div key={room.roomId} className={clsx("card p-4 flex items-center gap-3", a.status !== "free" && "bg-gray-50")}>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{room.name}</div>
                <div className="text-xs text-gray-500">
                  {room.location ?? "-"} • {room.capacity} ที่นั่ง
                </div>
                <div
                  className={clsx(
                    "text-xs mt-1",
                    a.status === "free" ? (a.shortened ? "text-amber-600" : "text-emerald-600") : "text-red-500"
                  )}
                >
                  {a.status === "free" && (a.shortened ? `ว่างถึง ${a.end} น. (มีคนจองต่อ)` : `ว่าง ${a.start}-${a.end} น.`)}
                  {a.status === "busy" && `ไม่ว่าง ถึง ${a.until} น.`}
                  {a.status === "short" && `ว่างไม่ถึง 15 นาที (มีคนจอง ${a.until} น.)`}
                </div>
              </div>
              <button
                type="button"
                disabled={a.status !== "free" || pending}
                onClick={() => book(room)}
                className={clsx("btn shrink-0", a.status === "free" ? "bg-amber-500 text-white hover:bg-amber-600" : "btn-outline")}
              >
                {loading ? "กำลังจอง..." : a.status === "free" ? `จอง ${a.start}-${a.end}` : "ไม่ว่าง"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
