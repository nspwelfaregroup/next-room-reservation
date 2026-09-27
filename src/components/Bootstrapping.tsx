"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingScreen, ErrorScreen } from "./LoadingScreen";
import { useLiff } from "@/providers/AppProvider";

const PHASE_TEXT: Record<string, string> = {
  init: "กำลังเชื่อมต่อ LINE...",
  login: "กำลังเข้าสู่ระบบ..."
};

export default function Bootstrapping({ children }: { children: React.ReactNode }) {
  const { phase, error, retry, user } = useLiff();
  const pathname = usePathname();
  const router = useRouter();

  // login เสร็จแล้วแต่ยังไม่ลงทะเบียน และเปลี่ยนหน้าออกจาก /register (เช่นกด tab หน้าแรก)
  // AppProvider ไม่ทำงานซ้ำตอนเปลี่ยนหน้า จึงต้อง redirect กลับจากตรงนี้
  const mustRegister = phase === "ready" && !user && pathname !== "/register";

  useEffect(() => {
    if (mustRegister) router.replace("/register");
  }, [mustRegister, router]);

  if (phase === "error") return <ErrorScreen error={error} onRetry={retry} />;

  // ลงทะเบียนแล้ว (มี session) → แสดงหน้าได้เลย ระหว่างที่ LIFF init ต่อเบื้องหลัง
  if (user) return <>{children}</>;

  // ยังไม่ลงทะเบียน → เข้าได้แค่หน้า /register หลัง LIFF พร้อม ที่เหลือรอ redirect
  if (phase === "ready" && pathname === "/register") return <>{children}</>;

  // detail ช่วยบอกว่าค้างที่ขั้นไหน (แสดงเมื่อโหลดนานเกิน 10 วินาที)
  return <LoadingScreen text={PHASE_TEXT[phase] || "กำลังโหลด..."} detail={`phase: ${phase} • ${pathname}`} />;
}
