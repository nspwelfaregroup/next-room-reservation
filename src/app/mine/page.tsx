import Link from "next/link";
import { Suspense } from "react";
import BookingCard from "@/components/BookingCard";
import EmptyState from "@/components/EmptyState";
import SkeletonList from "@/components/SkeletonList";
import TabLinks from "@/components/TabLinks";
import { requireSession } from "@/lib/auth";
import { getMyBookings, type MineTab } from "@/lib/data";

const TABS: { key: MineTab; label: string; empty: string }[] = [
  { key: "upcoming", label: "กำลังจะถึง", empty: "ไม่มีการจองที่กำลังจะถึง" },
  { key: "past", label: "ที่ผ่านมา", empty: "ยังไม่มีประวัติการประชุม" },
  { key: "cancelled", label: "ยกเลิก", empty: "ไม่มีการจองที่ยกเลิก" }
];

export default async function MinePage({ searchParams }: PageProps<"/mine">) {
  const { userId } = await requireSession();
  const { tab: tabParam } = await searchParams;
  const tab = TABS.find((t) => t.key === tabParam) ?? TABS[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">การจองของฉัน</h1>
        <Link href="/book" className="btn btn-primary py-1.5">
          + จอง
        </Link>
      </div>

      <TabLinks replace tabs={TABS.map((t) => ({ href: `/mine?tab=${t.key}`, label: t.label, active: t.key === tab.key }))} />

      {/* key={tab}: เปลี่ยนแท็บ = Suspense ตัวใหม่ → แสดง skeleton ทันทีระหว่างโหลด */}
      <Suspense key={tab.key} fallback={<SkeletonList count={4} />}>
        <MineList userId={userId} tab={tab.key} empty={tab.empty} />
      </Suspense>
    </div>
  );
}

async function MineList({ userId, tab, empty }: { userId: string; tab: MineTab; empty: string }) {
  const bookings = await getMyBookings(userId, tab);
  if (bookings.length === 0) return <EmptyState>{empty}</EmptyState>;
  return (
    <div className="space-y-2">
      {bookings.map((b) => (
        <BookingCard key={b.bookingId} b={b} />
      ))}
    </div>
  );
}
