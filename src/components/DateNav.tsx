"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { addDays, fmtDate, todayStr } from "@/lib/datetime";

/** เลื่อนวันแบบ ก่อนหน้า / วันนี้ / ถัดไป + เลือกวันจากปฏิทิน (เก็บวันไว้ใน ?date=) */
export default function DateNav({ basePath, date }: { basePath: string; date: string }) {
  const router = useRouter();
  const href = (d: string) => `${basePath}?date=${d}`;
  const today = todayStr();

  return (
    <div className="card p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Link href={href(addDays(date, -1))} className="btn btn-outline px-3 py-1.5" aria-label="วันก่อนหน้า">
          ‹
        </Link>
        <div className="text-center">
          <div className="font-semibold text-gray-900">{fmtDate(date)}</div>
          {date === today && <div className="text-[11px] text-blue-600">วันนี้</div>}
        </div>
        <Link href={href(addDays(date, 1))} className="btn btn-outline px-3 py-1.5" aria-label="วันถัดไป">
          ›
        </Link>
      </div>
      <div className="flex gap-2">
        <input type="date" className="input py-1.5" value={date} onChange={(e) => e.target.value && router.push(href(e.target.value))} />
        {date !== today && (
          <Link href={href(today)} className="btn btn-outline py-1.5 shrink-0">
            วันนี้
          </Link>
        )}
      </div>
    </div>
  );
}
