import Link from "next/link";
import clsx from "clsx";
import { dayMonthOf, timeOf } from "@/lib/datetime";
import { fullName } from "@/lib/format";
import type { Booking } from "@/types/types";

type BookingCardVariant = "live" | "past" | "cancelled";

function detectVariant(b: Booking): BookingCardVariant | undefined {
  if (b.status === "CANCELLED") return "cancelled";
  const now = Date.now();
  const start = new Date(b.startAt).getTime();
  const end = new Date(b.endAt).getTime();
  if (end < now) return "past";
  if (start <= now && now <= end) return "live";
  return undefined;
}

export default function BookingCard({ b, showUser, showRoom = true }: { b: Booking; showUser?: boolean; showRoom?: boolean }) {
  const variant = detectVariant(b);
  const isPast = variant === "past";
  const isCancelled = variant === "cancelled";
  const isLive = variant === "live";
  const dim = isPast || isCancelled;
  const { day, month } = dayMonthOf(b.startAt);

  return (
    <Link
      href={`/book/${b.bookingId}`}
      className={clsx("card p-4 flex gap-3 items-center hover:shadow-md transition", dim && "bg-gray-50 border-gray-200", isCancelled && "opacity-80")}
    >
      <div className="w-12 text-center shrink-0">
        <div className="text-xs text-gray-400">{month}</div>
        <div className={clsx("text-xl font-bold leading-none", dim ? "text-gray-400" : "text-blue-700")}>{day}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={clsx("font-medium truncate", dim && "text-gray-500 line-through")}>{b.title || "(ไม่มีหัวข้อ)"}</div>
          {isLive && (
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              กำลังประชุม
            </span>
          )}
          {isCancelled && (
            <span className="shrink-0 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">ยกเลิก</span>
          )}
          {isPast && (
            <span className="shrink-0 text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">สิ้นสุดแล้ว</span>
          )}
        </div>
        <div className={clsx("text-xs truncate", dim ? "text-gray-400" : "text-gray-500")}>
          {showRoom && <>{b.room?.name ?? "-"} • </>}
          {timeOf(b.startAt)}-{timeOf(b.endAt)} น.
        </div>
        {showUser && b.user && <div className="text-xs text-gray-400 truncate mt-0.5">โดย {fullName(b.user)}</div>}
      </div>
    </Link>
  );
}
