import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import DateNav from "@/components/DateNav";
import EmptyState from "@/components/EmptyState";
import SkeletonList from "@/components/SkeletonList";
import BackButton from "@/components/BackButton";
import { Bone } from "@/components/Skeletons";
import { requireSession } from "@/lib/auth";
import { getBookingsOnDate, getRoom } from "@/lib/data";
import { isDateStr, timeOf, todayStr } from "@/lib/datetime";
import { fullName } from "@/lib/format";
import type { Room } from "@/types/types";

// Next 16: params และ searchParams เป็น Promise ต้อง await ก่อนใช้
export default async function RoomDetailPage({ params, searchParams }: PageProps<"/rooms/[roomId]">) {
  const [{ userId }, { roomId }, { date: dateParam }] = await Promise.all([requireSession(), params, searchParams]);
  const date = isDateStr(dateParam) ? dateParam : todayStr();

  const room = await getRoom(roomId);
  if (!room) notFound();

  return (
    <div className="space-y-4">
      <BackButton href="/rooms" label="ห้องทั้งหมด" />
      <div>
        <h1 className="text-xl font-bold text-gray-900">{room.name}</h1>
        <div className="text-sm text-gray-500">
          {room.location ?? "-"} • {room.capacity} ที่นั่ง {!room.active && "• ปิดให้บริการ"}
        </div>
      </div>

      <DateNav basePath={`/rooms/${roomId}`} date={date} />

      {/* key={date}: เปลี่ยนวัน = แสดง skeleton ทันที แล้วค่อยใส่ตารางของวันใหม่ */}
      <Suspense key={date} fallback={<DaySkeleton />}>
        <RoomDay room={room} date={date} userId={userId} />
      </Suspense>

      {room.active && (
        <Link href={`/book?roomId=${roomId}&date=${date}`} className="btn btn-primary w-full">
          + จองห้องนี้
        </Link>
      )}
    </div>
  );
}

function DaySkeleton() {
  return (
    <div className="space-y-4">
      <Bone className="h-5 w-40" />
      <SkeletonList count={3} showUser />
    </div>
  );
}

async function RoomDay({ room, date, userId }: { room: Room; date: string; userId: string }) {
  const bookings = await getBookingsOnDate(date, room.roomId);
  const now = new Date();

  return (
    <>
      <section>
        <h2 className="font-semibold text-gray-900 mb-2">ตารางการจอง ({bookings.length})</h2>
        {bookings.length === 0 ? (
          <EmptyState>ยังไม่มีการจองในวันนี้</EmptyState>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => {
              const live = new Date(b.startAt) <= now && now < new Date(b.endAt);
              const mine = b.userId === userId;
              return (
                <Link key={b.bookingId} href={`/book/${b.bookingId}`} className="card p-3 flex gap-3 items-center hover:shadow-md transition">
                  <div className="w-16 shrink-0 text-center">
                    <div className="text-sm font-bold text-blue-700">{timeOf(b.startAt)}</div>
                    <div className="text-xs text-gray-400">{timeOf(b.endAt)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {b.title || "(ไม่มีหัวข้อ)"}
                      {live && <span className="ms-2 text-[10px] text-red-600">● กำลังประชุม</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Avatar src={b.user?.pictureUrl} name={fullName(b.user)} size={18} />
                      <span className="text-xs text-gray-500 truncate">
                        {fullName(b.user)}
                        {mine && " (คุณ)"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
