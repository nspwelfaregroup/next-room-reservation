"use client";

import { useTransition } from "react";
import clsx from "clsx";
import { shareMessages } from "@/lib/liff";
import { bookingCard, type BookingSummary } from "@/lib/line-messages";
import { useToast } from "@/providers/ToastProvider";

/** ส่งการ์ดเชิญประชุมให้เพื่อน/กลุ่ม LINE ผ่าน shareTargetPicker */
export default function ShareBookingButton({ booking, className }: { booking: BookingSummary; className?: string }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function onShare() {
    startTransition(async () => {
      const res = await shareMessages([bookingCard("invite", booking)]);
      if (res === "sent") toast.push("ส่งคำเชิญแล้ว");
      else if (res === "unavailable") toast.push("อุปกรณ์นี้ยังไม่รองรับการแชร์ กรุณาเปิดผ่านแอป LINE", "err");
      else if (res === "failed") toast.push("แชร์ไม่สำเร็จ กรุณาลองใหม่", "err");
    });
  }

  return (
    <button type="button" onClick={onShare} disabled={pending} className={clsx("btn bg-emerald-600 text-white hover:bg-emerald-700", className)}>
      {pending ? "กำลังเปิด..." : "📤 แชร์นัดประชุมให้ผู้เข้าร่วม"}
    </button>
  );
}
