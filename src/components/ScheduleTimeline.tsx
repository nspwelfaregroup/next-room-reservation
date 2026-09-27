"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { minToTime, minuteOfDay, timeToMin, todayStr } from "@/lib/datetime";
import type { BookingRules, Room } from "@/types/types";

export type TimelineBooking = {
  bookingId: string;
  roomId: string;
  startAt: string;
  endAt: string;
  title: string;
  userName: string;
  mine: boolean;
};

type Props = {
  rooms: Room[];
  bookings: TimelineBooking[];
  rules: BookingRules;
  date: string;
  serverNow: string;
};

const PX_PER_MIN = 1; // 1 ชั่วโมง = 60px
const COL_MIN_W = "min-w-[104px]";

export default function ScheduleTimeline({ rooms, bookings, rules, date, serverNow }: Props) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => new Date(serverNow));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const openMin = timeToMin(rules.openTime);
  const closeMin = timeToMin(rules.closeTime);
  const startHour = Math.floor(openMin / 60);
  const endHour = Math.ceil(closeMin / 60);
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const gridTop = startHour * 60;
  const height = (endHour - startHour) * 60 * PX_PER_MIN;

  const today = todayStr(now);
  const isToday = date === today;
  const isPast = date < today;
  const nowMin = isToday ? minuteOfDay(now, date) : isPast ? 24 * 60 : 0;
  const y = (min: number) => (Math.min(Math.max(min, gridTop), endHour * 60) - gridTop) * PX_PER_MIN;

  // เลื่อนไปที่เวลาปัจจุบัน (หรือ 08:00) ตอนเปิดหน้า
  useEffect(() => {
    const target = isToday ? nowMin : 8 * 60;
    scrollRef.current?.scrollTo({ top: Math.max(y(target) - 60, 0) });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ทำครั้งเดียวต่อวันที่
  }, [date]);

  /** แตะช่องว่าง → ไปหน้าจองพร้อมเติมห้อง/เวลาให้ */
  function onColumnClick(e: React.MouseEvent<HTMLDivElement>, roomId: string) {
    if ((e.target as HTMLElement).closest("a")) return; // แตะโดนการจอง ให้ Link ทำงานเอง
    const rect = e.currentTarget.getBoundingClientRect();
    let start = Math.floor((gridTop + (e.clientY - rect.top) / PX_PER_MIN) / 30) * 30;
    start = Math.max(start, openMin, isToday ? Math.ceil(nowMin / 15) * 15 : 0);

    const roomBookings = bookings.filter((b) => b.roomId === roomId).map((b) => ({ s: minuteOfDay(b.startAt, date), e: minuteOfDay(b.endAt, date) }));
    if (roomBookings.some((b) => b.s <= start && start < b.e)) return;
    const nextStart = Math.min(closeMin, ...roomBookings.filter((b) => b.s > start).map((b) => b.s));
    const end = Math.min(start + 60, nextStart);
    if (isPast || end - start < 15) return;

    router.push(`/book?roomId=${roomId}&date=${date}&start=${minToTime(start)}&end=${minToTime(end)}`);
  }

  return (
    <div className="card overflow-hidden">
      <div ref={scrollRef} className="max-h-[65vh] overflow-auto overscroll-contain">
        <div className="flex min-w-max">
          {/* คอลัมน์เวลา (ติดซ้าย) */}
          <div className="sticky left-0 z-20 bg-white w-12 shrink-0 border-r border-gray-100">
            <div className="sticky top-0 z-30 h-12 bg-white border-b border-gray-100" />
            <div className="relative" style={{ height }}>
              {hours.map((h) => (
                <div key={h} className="absolute right-1.5 -translate-y-1/2 text-[10px] text-gray-400" style={{ top: y(h * 60) }}>
                  {h > startHour && `${String(h).padStart(2, "0")}:00`}
                </div>
              ))}
              {isToday && nowMin >= gridTop && nowMin <= endHour * 60 && (
                <div className="absolute right-0 -translate-y-1/2 text-[10px] font-semibold text-red-500 bg-white pe-1" style={{ top: y(nowMin) }}>
                  {minToTime(nowMin)}
                </div>
              )}
            </div>
          </div>

          {rooms.map((room) => (
            <div key={room.roomId} className={clsx("flex-1 border-r border-gray-100 last:border-r-0", COL_MIN_W)}>
              {/* หัวคอลัมน์ชื่อห้อง (ติดบน) */}
              <Link
                href={`/rooms/${room.roomId}?date=${date}`}
                className="sticky top-0 z-10 h-12 px-2 flex flex-col justify-center bg-white border-b border-gray-100 text-center"
              >
                <div className="text-xs font-semibold text-gray-900 truncate">{room.name}</div>
                <div className="text-[10px] text-gray-400 truncate">
                  {room.location ?? "-"} • {room.capacity} ที่
                </div>
              </Link>

              <div
                className="relative cursor-pointer"
                style={{
                  height,
                  backgroundImage: `repeating-linear-gradient(to bottom, #f3f4f6 0 1px, transparent 1px ${60 * PX_PER_MIN}px)`
                }}
                onClick={(e) => onColumnClick(e, room.roomId)}
              >
                {/* นอกเวลาทำการ */}
                <div className="absolute inset-x-0 top-0 bg-gray-100/70" style={{ height: y(openMin) }} />
                <div className="absolute inset-x-0 bottom-0 bg-gray-100/70" style={{ height: height - y(closeMin) }} />
                {/* เวลาที่ผ่านไปแล้ว */}
                {(isToday || isPast) && <div className="absolute inset-x-0 top-0 bg-gray-50/80" style={{ height: y(nowMin) }} />}

                {bookings
                  .filter((b) => b.roomId === room.roomId)
                  .map((b) => {
                    const s = minuteOfDay(b.startAt, date);
                    const e = minuteOfDay(b.endAt, date);
                    const h = Math.max((e - s) * PX_PER_MIN, 22);
                    return (
                      <Link
                        key={b.bookingId}
                        href={`/book/${b.bookingId}`}
                        className={clsx(
                          "absolute inset-x-1 rounded-lg px-1.5 py-1 overflow-hidden text-[11px] leading-tight shadow-sm border",
                          b.mine ? "bg-blue-600 border-blue-700 text-white" : "bg-blue-50 border-blue-200 text-blue-900",
                          e <= nowMin && "opacity-60"
                        )}
                        style={{ top: y(s), height: h }}
                      >
                        <div className="font-semibold truncate">{b.title}</div>
                        {h >= 36 && (
                          <div className={clsx("truncate", b.mine ? "text-blue-100" : "text-blue-700/70")}>
                            {minToTime(s)}-{minToTime(e)}
                          </div>
                        )}
                        {h >= 52 && <div className={clsx("truncate", b.mine ? "text-blue-100" : "text-gray-500")}>{b.userName}</div>}
                      </Link>
                    );
                  })}

                {/* เส้นเวลาปัจจุบัน */}
                {isToday && nowMin >= gridTop && nowMin <= endHour * 60 && (
                  <div className="absolute inset-x-0 h-0.5 bg-red-500 z-[5] pointer-events-none" style={{ top: y(nowMin) }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 px-3 py-2 border-t border-gray-100 text-[11px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-600" /> ของฉัน
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200" /> คนอื่น
        </span>
        {!isPast && <span className="ms-auto">แตะช่องว่างเพื่อจอง</span>}
      </div>
    </div>
  );
}
