"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SkeletonList from "./SkeletonList";
import SlowReloadHint from "./SlowReloadHint";
import { useLiff } from "@/providers/AppProvider";

const RELOAD_KEY = "home-session-reload-at";
const RELOAD_AFTER_MS = 4_000;

/**
 * ใช้ในหน้าที่ server render ตอนยังไม่มี cookie (เช่น cookie หมดอายุ / LINE ล้าง cookie ตอนปิด LIFF)
 * 1) พอ AppProvider login เสร็จ → router.refresh() ให้ server render ใหม่ด้วย cookie ใหม่
 * 2) ถ้าผ่านไป 4 วินาทีแล้วยังอยู่หน้านี้ (refresh ไม่ได้ผล) → โหลดทั้งหน้าใหม่ 1 ครั้ง
 *    (จำเวลาไว้ใน sessionStorage กันโหลดวนไม่รู้จบ)
 */
export default function RefreshWhenUserReady({ count = 4 }: { count?: number }) {
  const { user } = useLiff();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    router.refresh();

    const timer = setTimeout(() => {
      try {
        const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
        if (Date.now() - last < 60_000) return; // เพิ่ง reload ไปแล้ว ให้ผู้ใช้กดปุ่มเอง
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      } catch {
        // sessionStorage ใช้ไม่ได้ → ไม่ reload อัตโนมัติ ป้องกันวนลูป
        return;
      }
      window.location.reload();
    }, RELOAD_AFTER_MS);

    return () => clearTimeout(timer);
  }, [user, router]);

  return (
    <div className="space-y-2">
      <SkeletonList count={count} />
      <SlowReloadHint afterMs={8_000} tag={`waiting-session • user:${user ? "yes" : "no"}`} />
    </div>
  );
}
