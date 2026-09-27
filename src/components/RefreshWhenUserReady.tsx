"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SkeletonList from "./SkeletonList";
import { useLiff } from "@/providers/AppProvider";

/**
 * ใช้ในหน้าที่ server render ตอนยังไม่มี cookie (เช่น cookie หมดอายุระหว่างปิดแอป)
 * พอ AppProvider login เสร็จและได้ user แล้ว → สั่ง server render หน้านี้ใหม่ด้วย cookie ใหม่
 */
export default function RefreshWhenUserReady({ count = 4 }: { count?: number }) {
  const { user } = useLiff();
  const router = useRouter();

  useEffect(() => {
    if (user) router.refresh();
  }, [user, router]);

  return <SkeletonList count={count} />;
}
