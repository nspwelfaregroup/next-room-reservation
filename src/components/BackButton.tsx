import Link from "next/link";
import { LinkPending } from "./TabLinks";

/** ปุ่มย้อนกลับของหน้าย่อย — ระบุปลายทางชัดเจน (ไม่ใช้ history.back เพราะใน LIFF ประวัติอาจเป็นหน้า login) */
export default function BackButton({ href, label = "กลับ" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1 h-9 ps-1.5 pe-4 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition"
    >
      <span className="relative grid place-items-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5" aria-hidden>
          <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* ระหว่างรอเปลี่ยนหน้า แสดงวงหมุนรอบลูกศร */}
        <LinkPending className="absolute inset-0 w-6! h-6! text-blue-400" />
      </span>
      {label}
    </Link>
  );
}

/** skeleton ขนาดเท่าปุ่มย้อนกลับ ใช้ใน loading.tsx */
export function BackButtonSkeleton() {
  return <div className="h-9 w-28 rounded-full bg-white border border-gray-200 shadow-sm animate-pulse" />;
}
