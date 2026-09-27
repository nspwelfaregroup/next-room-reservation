import BookingForm from "@/components/BookingForm";
import EmptyState from "@/components/EmptyState";
import { requireUser } from "@/lib/auth";
import { getBookingRules, getRooms } from "@/lib/data";
import { addDays, isDateStr, isTimeStr, todayStr } from "@/lib/datetime";

/** หน้าจองใหม่ — รับค่าตั้งต้นจาก URL ได้ เช่น /book?roomId=...&date=2026-09-30&start=09:00&end=10:00 */
export default async function BookPage({ searchParams }: PageProps<"/book">) {
  await requireUser();
  const sp = await searchParams;
  const [rooms, rules] = await Promise.all([getRooms(), getBookingRules()]);

  if (rooms.length === 0) return <EmptyState>ยังไม่มีห้องที่เปิดให้จอง</EmptyState>;

  const today = todayStr();
  const date = isDateStr(sp.date) && sp.date >= today && sp.date <= addDays(today, rules.maxDaysAhead) ? sp.date : today;
  const roomId = typeof sp.roomId === "string" && rooms.some((r) => r.roomId === sp.roomId) ? sp.roomId : "";
  const startTime = isTimeStr(sp.start) && sp.start >= rules.openTime ? sp.start : rules.openTime < "09:00" ? "09:00" : rules.openTime;
  const endTime = isTimeStr(sp.end) && sp.end > startTime && sp.end <= rules.closeTime ? sp.end : "";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">จองห้องประชุม</h1>
      <BookingForm
        rooms={rooms}
        rules={rules}
        initial={{
          roomId,
          date,
          startTime,
          endTime: endTime || addHour(startTime, rules.closeTime),
          title: "",
          attendees: 1,
          notes: ""
        }}
      />
    </div>
  );
}

function addHour(time: string, max: string) {
  const h = String(Math.min(Number(time.slice(0, 2)) + 1, 23)).padStart(2, "0");
  const next = `${h}:${time.slice(3, 5)}`;
  return next > max ? max : next;
}
