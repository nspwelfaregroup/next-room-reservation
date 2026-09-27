import { notFound, redirect } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import { requireSession } from "@/lib/auth";
import { getBooking, getBookingRules, getRooms } from "@/lib/data";
import { dateOf, timeOf } from "@/lib/datetime";

export default async function EditBookingPage({ params }: PageProps<"/book/[bookId]/edit">) {
  const [me, { bookId }] = await Promise.all([requireSession(), params]);

  const [b, rooms, rules] = await Promise.all([getBooking(bookId), getRooms(), getBookingRules()]);
  if (!b) notFound();

  // แก้ได้เฉพาะของตัวเอง ที่ยังไม่ยกเลิกและยังไม่เริ่ม
  if (b.userId !== me.userId || b.status !== "ACTIVE" || new Date(b.startAt) <= new Date()) {
    redirect(`/book/${bookId}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">แก้ไขการจอง</h1>
      <BookingForm
        bookingId={b.bookingId}
        rooms={rooms}
        rules={rules}
        initial={{
          roomId: b.roomId,
          date: dateOf(b.startAt),
          startTime: timeOf(b.startAt),
          endTime: timeOf(b.endAt),
          title: b.title ?? "",
          attendees: b.attendees ?? 1,
          notes: b.notes ?? ""
        }}
      />
    </div>
  );
}
