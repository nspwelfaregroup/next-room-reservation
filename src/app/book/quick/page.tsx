import BackButton from "@/components/BackButton";
import QuickBook from "@/components/QuickBook";
import { requireSession } from "@/lib/auth";
import { getBookingRules, getBookingsOnDate, getRooms } from "@/lib/data";
import { todayStr } from "@/lib/datetime";

/** จองด่วน: ใช้ห้องตอนนี้เลย */
export default async function QuickBookPage() {
  const today = todayStr();
  const [, rooms, bookings, rules] = await Promise.all([requireSession(), getRooms(), getBookingsOnDate(today), getBookingRules()]);

  return (
    <div className="space-y-4">
      <BackButton href="/book" label="จองแบบระบุเวลา" />
      <div>
        <h1 className="text-xl font-bold text-gray-900">⚡ จองด่วน</h1>
        <p className="text-sm text-gray-500">ใช้ห้องตั้งแต่ตอนนี้ เลือกระยะเวลาแล้วกดจองได้เลย</p>
      </div>
      <QuickBook
        rooms={rooms}
        // ส่งเฉพาะข้อมูลที่ใช้ ลดขนาดข้อมูลที่ส่งไป browser
        bookings={bookings.map((b) => ({ roomId: b.roomId, startAt: b.startAt, endAt: b.endAt }))}
        rules={rules}
        serverNow={new Date().toISOString()}
      />
    </div>
  );
}
