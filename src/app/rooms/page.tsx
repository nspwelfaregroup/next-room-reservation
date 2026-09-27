import Link from "next/link";
import clsx from "clsx";
import EmptyState from "@/components/EmptyState";
import RoomsViewTabs from "@/components/RoomsViewTabs";
import { requireSession } from "@/lib/auth";
import { getBookingsOnDate, getRooms } from "@/lib/data";
import { timeOf, todayStr } from "@/lib/datetime";
import type { Booking } from "@/types/types";

export default async function RoomsPage() {
  await requireSession();

  const today = todayStr();
  const [rooms, bookings] = await Promise.all([getRooms(), getBookingsOnDate(today)]);
  const now = new Date();

  // จัดกลุ่มการจองวันนี้ตามห้อง
  const byRoom = new Map<string, Booking[]>();
  for (const b of bookings) byRoom.set(b.roomId, [...(byRoom.get(b.roomId) ?? []), b]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">ห้องประชุม</h1>
        <Link href="/book/quick" className="btn btn-outline py-1.5 text-amber-600">
          ⚡ จองด่วน
        </Link>
      </div>
      <RoomsViewTabs active="list" />

      {rooms.length === 0 && <EmptyState>ยังไม่มีห้องประชุม</EmptyState>}

      <div className="space-y-3">
        {rooms.map((room) => {
          const list = byRoom.get(room.roomId) ?? [];
          const current = list.find((b) => new Date(b.startAt) <= now && now < new Date(b.endAt));
          const next = list.find((b) => new Date(b.startAt) > now);

          return (
            <Link key={room.roomId} href={`/rooms/${room.roomId}`} className="card p-4 block hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{room.name}</div>
                  <div className="text-xs text-gray-500">
                    {room.location ?? "-"} • {room.capacity} ที่นั่ง
                  </div>
                </div>
                <span
                  className={clsx(
                    "shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border",
                    current ? "text-red-600 bg-red-50 border-red-200" : "text-emerald-700 bg-emerald-50 border-emerald-200"
                  )}
                >
                  {current ? `ไม่ว่างถึง ${timeOf(current.endAt)}` : "ว่างตอนนี้"}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                วันนี้จองแล้ว {list.length} รายการ
                {next && (
                  <>
                    {" "}
                    • ถัดไป {timeOf(next.startAt)}-{timeOf(next.endAt)} น.
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
