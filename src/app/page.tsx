import Link from "next/link";
import { Suspense } from "react";

import Avatar from "@/components/Avatar";
import BookingCard from "@/components/BookingCard";
import EmptyState from "@/components/EmptyState";
import SkeletonList from "@/components/SkeletonList";
import { getCurrentUser } from "@/lib/auth";
import { getBookingsOnDate, getMyBookings } from "@/lib/data";
import { fmtDate, todayStr } from "@/lib/datetime";
import { fullName } from "@/lib/format";

// Server Component: ดึงข้อมูลจาก Supabase ตรงๆ บน server แล้วส่ง HTML ไปให้ browser
export default async function Home() {
  const user = await getCurrentUser();

  // เปิดครั้งแรกยังไม่มี cookie → AppProvider จะ login แล้ว refresh หน้านี้ให้เอง
  if (!user) return <SkeletonList count={4} />;

  const today = todayStr();

  return (
    <div className="space-y-5">
      <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center">
          <Avatar src={user.pictureUrl} name={fullName(user)} size={55} />
          <div className="ms-4 min-w-0">
            <div className="text-sm opacity-80">สวัสดี</div>
            <div className="text-xl font-bold truncate">{fullName(user)}</div>
            {user.departmentName && <div className="text-xs opacity-80 truncate">แผนก{user.departmentName}</div>}
          </div>
        </div>
        <Link href="/book" className="inline-block mt-4 bg-white text-blue-700 px-4 py-2 rounded-full font-medium text-sm shadow">
          + จองห้องประชุม
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">การจองที่กำลังจะถึงของฉัน</h2>
          <Link href="/mine" className="text-xs text-blue-600">
            ดูทั้งหมด →
          </Link>
        </div>
        {/* Suspense: แสดง skeleton ระหว่างรอ query แล้วค่อย stream ผลลัพธ์ตามมา */}
        <Suspense fallback={<SkeletonList count={2} />}>
          <MyUpcoming userId={user.userId} />
        </Suspense>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">การจองวันนี้ • {fmtDate(today)}</h2>
          <Link href="/rooms" className="text-xs text-blue-600">
            ดูห้อง →
          </Link>
        </div>
        <Suspense fallback={<SkeletonList count={3} showUser />}>
          <TodayBookings date={today} />
        </Suspense>
      </section>
    </div>
  );
}

async function MyUpcoming({ userId }: { userId: string }) {
  const mine = await getMyBookings(userId, "upcoming", 3);
  if (mine.length === 0) return <EmptyState>ยังไม่มีการจองที่กำลังจะถึง</EmptyState>;
  return (
    <div className="space-y-2">
      {mine.map((b) => (
        <BookingCard key={b.bookingId} b={b} />
      ))}
    </div>
  );
}

async function TodayBookings({ date }: { date: string }) {
  const bookings = await getBookingsOnDate(date);
  if (bookings.length === 0) return <EmptyState>วันนี้ยังไม่มีการจอง</EmptyState>;
  return (
    <div className="space-y-2">
      {bookings.map((b) => (
        <BookingCard key={b.bookingId} b={b} showUser />
      ))}
    </div>
  );
}
