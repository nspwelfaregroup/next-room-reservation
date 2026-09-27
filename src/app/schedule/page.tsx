import Link from "next/link";
import { Suspense } from "react";
import DateNav from "@/components/DateNav";
import EmptyState from "@/components/EmptyState";
import RoomsViewTabs from "@/components/RoomsViewTabs";
import ScheduleTimeline from "@/components/ScheduleTimeline";
import { TimelineSkeleton } from "@/components/Skeletons";
import { requireSession } from "@/lib/auth";
import { getBookingRules, getBookingsOnDate, getRooms } from "@/lib/data";
import { isDateStr, todayStr } from "@/lib/datetime";
import { fullName } from "@/lib/format";

/** ตารางรวมทุกห้องของวันที่เลือก */
export default async function SchedulePage({ searchParams }: PageProps<"/schedule">) {
  const [{ userId }, { date: dateParam }] = await Promise.all([requireSession(), searchParams]);
  const date = isDateStr(dateParam) ? dateParam : todayStr();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">ห้องประชุม</h1>
        <Link href="/book/quick" className="btn btn-outline py-1.5 text-amber-600">
          ⚡ จองด่วน
        </Link>
      </div>
      <RoomsViewTabs active="timeline" date={date} />
      <DateNav basePath="/schedule" date={date} />

      <Suspense key={date} fallback={<TimelineSkeleton />}>
        <Timeline date={date} userId={userId} />
      </Suspense>
    </div>
  );
}

async function Timeline({ date, userId }: { date: string; userId: string }) {
  const [rooms, bookings, rules] = await Promise.all([getRooms(), getBookingsOnDate(date), getBookingRules()]);
  if (rooms.length === 0) return <EmptyState>ยังไม่มีห้องประชุม</EmptyState>;

  return (
    <ScheduleTimeline
      rooms={rooms}
      // ส่งแค่ที่จำเป็น ไม่ส่ง userId ของคนอื่นไปที่ browser
      bookings={bookings.map((b) => ({
        bookingId: b.bookingId,
        roomId: b.roomId,
        startAt: b.startAt,
        endAt: b.endAt,
        title: b.title || "(ไม่มีหัวข้อ)",
        userName: fullName(b.user),
        mine: b.userId === userId
      }))}
      rules={rules}
      date={date}
      serverNow={new Date().toISOString()}
    />
  );
}
