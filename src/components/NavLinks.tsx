"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useLiff } from "@/providers/AppProvider";
import { LinkPending } from "./TabLinks";

const nav = [
  { to: "/", label: "หน้าแรก", icon: "🏠" },
  { to: "/rooms", label: "ห้อง", icon: "🏢" },
  { to: "/book", label: "จอง", icon: "➕" },
  { to: "/mine", label: "ของฉัน", icon: "📅" },
  { to: "/me", label: "โปรไฟล์", icon: "👤" }
];

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  if (to === "/book") return pathname === "/book" || pathname === "/book/quick"; // /book/[id] เป็นหน้ารายละเอียด ไม่ใช่หน้าจอง
  if (to === "/rooms") return pathname.startsWith("/rooms") || pathname === "/schedule";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavLinks() {
  const pathname = usePathname();
  const { user } = useLiff();

  // ยังไม่ลงทะเบียน ไม่ต้องแสดงเมนู
  if (!user) return null;

  return (
    <footer className="sticky bottom-0 z-10 bg-white/90 backdrop-blur border-t border-gray-100">
      <nav className="px-2 pt-1.5 pb-1 flex justify-around gap-1">
        {nav.map((n) => {
          const active = isActive(pathname, n.to);
          return (
            <Link
              key={n.to}
              href={n.to}
              className={clsx(
                "relative flex-1 py-2 rounded-xl text-xs flex flex-col items-center gap-1 transition-all duration-200",
                active ? "text-blue-700 font-semibold bg-blue-50" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <span
                className={clsx(
                  "absolute top-0 left-1/2 -translate-x-1/2 h-1 rounded-full bg-blue-600 transition-all duration-200",
                  active ? "w-8 opacity-100" : "w-0 opacity-0"
                )}
              />
              <span className={clsx("leading-none transition-transform duration-200", active ? "text-xl scale-110" : "text-lg")}>{n.icon}</span>
              <span>{n.label}</span>
              <LinkPending className="absolute top-1.5 right-2 w-2.5 h-2.5 text-blue-600" />
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
export default NavLinks;
