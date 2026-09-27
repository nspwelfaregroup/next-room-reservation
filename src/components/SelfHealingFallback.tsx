"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SkeletonList from "./SkeletonList";
import SlowReloadHint from "./SlowReloadHint";

const REFRESH_AFTER_MS = 5_000;

// หลาย fallback ในหน้าเดียวกันใช้ตัวแปรนี้ร่วมกัน → refresh แค่ครั้งเดียว (ถ้าสั่งพร้อมกันจะยกเลิกกันเองจนค้างอีก)
let lastRefreshAt = 0;

/**
 * Suspense fallback ที่ซ่อมตัวเองได้:
 * ถ้าข้อมูลใน Suspense ยังไม่มาภายใน 5 วินาที (เช่น stream ถูกตัดกลางคันใน LINE WebView)
 * → router.refresh() ขอข้อมูลใหม่ 1 ครั้ง ถ้ายังค้างอีก ให้ผู้ใช้กดโหลดใหม่เอง
 * เมื่อข้อมูลมาแล้ว component นี้จะถูกถอดออก timer ก็ถูกยกเลิกไปด้วย
 */
export default function SelfHealingFallback({ count = 3, showUser, tag }: { count?: number; showUser?: boolean; tag: string }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastRefreshAt < REFRESH_AFTER_MS) return;
      lastRefreshAt = Date.now();
      router.refresh();
    }, REFRESH_AFTER_MS);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="space-y-2">
      <SkeletonList count={count} showUser={showUser} />
      <SlowReloadHint afterMs={12_000} tag={tag} />
    </div>
  );
}
