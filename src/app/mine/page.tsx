import Link from "next/link";
import clsx from "clsx";
import BookingCard from "@/components/BookingCard";
import EmptyState from "@/components/EmptyState";
import { requireUser } from "@/lib/auth";
import { getMyBookings, type MineTab } from "@/lib/data";

const TABS: { key: MineTab; label: string; empty: string }[] = [
  { key: "upcoming", label: "กำลังจะถึง", empty: "ไม่มีการจองที่กำลังจะถึง" },
  { key: "past", label: "ที่ผ่านมา", empty: "ยังไม่มีประวัติการประชุม" },
  { key: "cancelled", label: "ยกเลิก", empty: "ไม่มีการจองที่ยกเลิก" }
];

export default async function MinePage({ searchParams }: PageProps<"/mine">) {
  const me = await requireUser();
  const { tab: tabParam } = await searchParams;
  const tab = TABS.find((t) => t.key === tabParam) ?? TABS[0];

  const bookings = await getMyBookings(me.userId, tab.key);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">การจองของฉัน</h1>
        <Link href="/book" className="btn btn-primary py-1.5">
          + จอง
        </Link>
      </div>

      <div className="card p-1 flex gap-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/mine?tab=${t.key}`}
            replace
            className={clsx(
              "flex-1 text-center text-sm py-2 rounded-xl transition",
              t.key === tab.key ? "bg-blue-600 text-white font-medium" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <EmptyState>{tab.empty}</EmptyState>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => (
            <BookingCard key={b.bookingId} b={b} />
          ))}
        </div>
      )}
    </div>
  );
}
