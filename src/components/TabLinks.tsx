"use client";

import Link, { useLinkStatus } from "next/link";
import clsx from "clsx";

/** จุดหมุนเล็กๆ ระหว่างรอเปลี่ยนหน้า (useLinkStatus ต้องอยู่ข้างใน <Link>) */
export function LinkPending({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={clsx(
        "inline-block w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin transition-opacity",
        pending ? "opacity-70" : "opacity-0",
        className
      )}
    />
  );
}

export type TabItem = { href: string; label: string; active: boolean };

/** แถบแท็บแบบ segmented — ใช้ในหน้า /mine และสลับ รายการห้อง/ตารางรวม */
export default function TabLinks({ tabs, replace }: { tabs: TabItem[]; replace?: boolean }) {
  return (
    <div className="card p-1 flex gap-1">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          replace={replace}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-xl transition",
            t.active ? "bg-blue-600 text-white font-medium" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <LinkPending className="w-2.5 h-2.5 -ms-4" />
          {t.label}
        </Link>
      ))}
    </div>
  );
}
