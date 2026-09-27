"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types/types";
import { getIDTokenLiff, getLiffUserId, initLiff } from "@/lib/liff";
import { LIFF_ID } from "@/lib/config";
import { loginWithLine } from "@/actions/auth";
import { withTimeout } from "@/lib/async";

type Phase = "init" | "login" | "ready" | "error";

type Ctx = {
  phase: Phase;
  loading: boolean;
  error: string;
  user: User | null;
  setUser: (u: User | null) => void;
  retry: () => void;
};

export const AppContext = createContext<Ctx | null>(null);

export default function AppProvider({ initialUser, children }: { initialUser: User | null; children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("init");
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(initialUser);

  // ให้ bootstrap อ่าน user ล่าสุดได้ตอนกดลองใหม่ โดยไม่ต้องใส่ user ใน deps
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const router = useRouter();

  useEffect(() => {
    async function bootstrap() {
      try {
        setPhase("init");
        setError("");
        await initLiff(LIFF_ID);

        // มี session ที่ลงทะเบียนแล้ว และเป็นบัญชี LINE เดียวกัน → ไม่ต้องยิง server ซ้ำ
        const current = userRef.current;
        if (current && current.userId === getLiffUserId()) {
          setPhase("ready");
          return;
        }

        setPhase("login");
        const idToken = getIDTokenLiff();
        if (!idToken) return; // กำลัง redirect ไป LINE login

        const res = await withTimeout(loginWithLine(idToken), 20_000, "เข้าสู่ระบบนานเกินไป กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่");
        const pathname = window.location.pathname;

        if (res.status === "ok") {
          setUser(res.user);
          if (pathname === "/register") router.replace("/");
        } else if (res.status === "unregistered") {
          setUser(null);
          if (pathname !== "/register") router.replace("/register");
        } else if (res.status === "invalid") {
          throw new Error("ไม่สามารถยืนยันตัวตนกับ LINE ได้");
        } else {
          throw new Error("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
        }

        setPhase("ready");
      } catch (error: unknown) {
        console.error(error);
        setError(error instanceof Error ? error.message : String(error));
        setPhase("error");
      }
    }

    bootstrap();
  }, [router]);

  // LINE อาจคืนหน้าเดิมจาก cache (bfcache) ตอนเปิด LIFF ใหม่ งานที่ค้างอยู่จะไม่ทำต่อ → โหลดหน้าใหม่
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return (
    <AppContext.Provider
      value={{
        phase,
        loading: phase !== "ready" && phase !== "error",
        error,
        user,
        setUser,
        // โหลดหน้าใหม่ทั้งหมด ชัวร์กว่าลองซ้ำใน state เดิม (promise ที่ค้างจะหายไปด้วย)
        retry: () => window.location.reload()
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useLiff() {
  const context = useContext(AppContext);

  if (!context) throw new Error("useLiff must be used inside AppProvider");
  return context;
}
