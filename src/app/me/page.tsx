import Avatar from "@/components/Avatar";
import ProfileForm from "@/components/ProfileForm";
import { requireUser } from "@/lib/auth";
import { getDepartments } from "@/lib/data";
import { fmtDate, dateOf } from "@/lib/datetime";
import { fullName } from "@/lib/format";

export default async function MePage() {
  const me = await requireUser();
  const departments = await getDepartments();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">โปรไฟล์</h1>

      <div className="card p-4 flex items-center gap-3">
        <Avatar src={me.pictureUrl} name={fullName(me)} size={56} />
        <div className="min-w-0">
          <div className="font-semibold truncate">{fullName(me)}</div>
          <div className="text-xs text-gray-500 truncate">LINE: {me.displayName}</div>
          {me.registeredAt && <div className="text-xs text-gray-400">ลงทะเบียนเมื่อ {fmtDate(dateOf(me.registeredAt))}</div>}
        </div>
      </div>

      <ProfileForm
        // key: หลังบันทึก หน้า refresh ได้ค่าใหม่ → reset ฟอร์มให้ตรงกับ DB
        key={`${me.firstName}|${me.lastName}|${me.department}`}
        mode="edit"
        departments={departments}
        initial={{ firstName: me.firstName ?? "", lastName: me.lastName ?? "", department: me.department ?? "" }}
      />

      <p className="text-xs text-gray-400 text-center">ชื่อและรูป LINE จะอัปเดตอัตโนมัติทุกครั้งที่เปิดแอป</p>
    </div>
  );
}
