import type { liff } from "@line/liff";
import { LIFF_ID } from "./config";
import { fmtDate } from "./datetime";

type Message = Parameters<typeof liff.sendMessages>[0][number];

export type BookingSummary = {
  bookingId: string;
  title: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
};

export type BookingEvent = "created" | "updated" | "cancelled";

const EVENT_STYLE: Record<BookingEvent, { label: string; color: string }> = {
  created: { label: "✅ จองห้องประชุมแล้ว", color: "#1d4ed8" },
  updated: { label: "✏️ แก้ไขการจองแล้ว", color: "#b45309" },
  cancelled: { label: "❌ ยกเลิกการจองแล้ว", color: "#dc2626" }
};

const row = (icon: string, text: string) => ({
  type: "box" as const,
  layout: "baseline" as const,
  spacing: "sm" as const,
  contents: [
    { type: "text" as const, text: icon, size: "sm" as const, flex: 0 },
    { type: "text" as const, text, size: "sm" as const, color: "#4b5563", wrap: true, flex: 1 }
  ]
});

/** การ์ด Flex Message สรุปการจอง */
export function bookingCard(event: BookingEvent, b: BookingSummary): Message {
  const style = EVENT_STYLE[event];
  const time = `${b.startTime}-${b.endTime} น.`;

  return {
    type: "flex",
    altText: `${style.label}: ${b.roomName} ${fmtDate(b.date)} ${time}`,
    contents: {
      type: "bubble",
      size: "kilo",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          { type: "text", text: style.label, weight: "bold", size: "sm", color: style.color },
          {
            type: "text",
            text: b.title || "(ไม่มีหัวข้อ)",
            weight: "bold",
            size: "lg",
            wrap: true,
            ...(event === "cancelled" ? { decoration: "line-through" as const, color: "#9ca3af" } : {})
          },
          {
            type: "box",
            layout: "vertical",
            spacing: "xs",
            contents: [row("🏢", b.roomName), row("📅", fmtDate(b.date)), row("⏰", time)]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: event === "cancelled" ? "secondary" : "primary",
            color: event === "cancelled" ? undefined : style.color,
            height: "sm",
            action: { type: "uri", label: "ดูรายละเอียด", uri: `https://liff.line.me/${LIFF_ID}/book/${b.bookingId}` }
          }
        ]
      }
    }
  };
}
