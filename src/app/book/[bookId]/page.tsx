import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import CancelBookingButton from "@/components/CancelBookingButton";
import ShareBookingButton from "@/components/ShareBookingButton";
import { requireSession } from "@/lib/auth";
import { getBooking } from "@/lib/data";
import { dateOf, fmtDate, timeOf } from "@/lib/datetime";
import { fullName } from "@/lib/format";

export default async function BookingDetailPage({ params }: PageProps<"/book/[bookId]">) {
  const [me, { bookId }] = await Promise.all([requireSession(), params]);

  const b = await getBooking(bookId);
  if (!b) notFound();

  const now = new Date();
  const isOwner = b.userId === me.userId;
  const isActive = b.status === "ACTIVE";
  const started = new Date(b.startAt) <= now;
  const ended = new Date(b.endAt) <= now;
  const date = dateOf(b.startAt);

  // ข้อมูลสรุปสำหรับการ์ด LINE (แชร์ / ยกเลิก)
  const summary = {
    bookingId: b.bookingId,
    title: b.title ?? "",
    roomName: b.room?.name ?? "-",
    date,
    startTime: timeOf(b.startAt),
    endTime: timeOf(b.endAt)
  };

  const statusLabel = !isActive ? "ยกเลิกแล้ว" : ended ? "สิ้นสุดแล้ว" : started ? "กำลังประชุม" : "กำลังจะถึง";
  const statusTone = !isActive
    ? "text-red-600 bg-red-50 border-red-200"
    : ended
      ? "text-gray-500 bg-gray-100 border-gray-200"
      : started
        ? "text-red-600 bg-red-50 border-red-200"
        : "text-blue-700 bg-blue-50 border-blue-200";

  return (
    <div className="space-y-4">
      <Link href={b.room ? `/rooms/${b.roomId}?date=${date}` : "/mine"} className="text-sm text-blue-600">
        ‹ กลับ
      </Link>

      <div className="card p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-bold text-gray-900 wrap-break-word">{b.title || "(ไม่มีหัวข้อ)"}</h1>
          <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusTone}`}>{statusLabel}</span>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-gray-500">ห้อง</dt>
          <dd className="font-medium">
            {b.room?.name ?? "-"} <span className="text-gray-400 font-normal">{b.room?.location}</span>
          </dd>
          <dt className="text-gray-500">วันที่</dt>
          <dd>{fmtDate(date)}</dd>
          <dt className="text-gray-500">เวลา</dt>
          <dd>
            {timeOf(b.startAt)} - {timeOf(b.endAt)} น.
          </dd>
          <dt className="text-gray-500">ผู้เข้าร่วม</dt>
          <dd>{b.attendees ?? "-"} คน</dd>
          {b.notes && (
            <>
              <dt className="text-gray-500">หมายเหตุ</dt>
              <dd className="whitespace-pre-wrap wrap-break-word">{b.notes}</dd>
            </>
          )}
        </dl>

        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <Avatar src={b.user?.pictureUrl} name={fullName(b.user)} size={32} />
          <div className="text-sm">
            <div className="text-gray-500 text-xs">ผู้จอง</div>
            <div className="font-medium">
              {fullName(b.user)}
              {isOwner && " (คุณ)"}
            </div>
          </div>
        </div>
      </div>

      {isOwner && isActive && !ended && (
        <>
          <ShareBookingButton className="w-full" booking={{ ...summary, organizer: fullName(b.user), notes: b.notes }} />
          <div className="flex gap-2">
            {!started && (
              <Link href={`/book/${b.bookingId}/edit`} className="btn btn-outline flex-1">
                ✏️ แก้ไข
              </Link>
            )}
            <CancelBookingButton className="flex-1" booking={summary} />
          </div>
        </>
      )}

      {isActive && !ended && (
        <Link href={`/book?roomId=${b.roomId}&date=${date}`} className="btn btn-outline w-full">
          ดูเวลาว่างอื่นของห้องนี้
        </Link>
      )}
    </div>
  );
}
