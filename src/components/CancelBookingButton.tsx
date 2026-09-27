"use client";

import { useTransition } from "react";
import clsx from "clsx";
import { cancelBooking } from "@/actions/booking";
import { sendChatMessages } from "@/lib/liff";
import { bookingCard, type BookingSummary } from "@/lib/line-messages";
import { useToast } from "@/providers/ToastProvider";

export default function CancelBookingButton({ booking, className }: { booking: BookingSummary; className?: string }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function onCancel() {
    if (!window.confirm("ยืนยันยกเลิกการจองนี้?")) return;
    startTransition(async () => {
      const res = await cancelBooking(booking.bookingId);
      if (!res.ok) {
        toast.push(res.error, "err");
        return;
      }
      // สำเร็จแล้ว action เรียก refresh() หน้านี้จะแสดงสถานะ "ยกเลิกแล้ว" เอง
      toast.push("ยกเลิกการจองแล้ว");
      await sendChatMessages([bookingCard("cancelled", booking)]);
    });
  }

  return (
    <button type="button" onClick={onCancel} disabled={pending} className={clsx("btn btn-danger", className)}>
      {pending ? "กำลังยกเลิก..." : "ยกเลิกการจอง"}
    </button>
  );
}
