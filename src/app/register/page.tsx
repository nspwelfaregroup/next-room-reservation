import LineProfilePreview from "@/components/LineProfilePreview";
import ProfileForm from "@/components/ProfileForm";
import { getDepartments } from "@/lib/data";

// proxy ให้เข้าหน้านี้ได้เฉพาะคนที่ verify กับ LINE แล้วแต่ยังไม่ลงทะเบียน
export default async function RegisterPage() {
  const departments = await getDepartments();

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1 pt-2">
        <h1 className="text-xl font-bold text-gray-900">ลงทะเบียนใช้งาน</h1>
        <p className="text-sm text-gray-500">กรอกข้อมูลก่อนเริ่มจองห้องประชุม</p>
      </div>
      <LineProfilePreview />
      <ProfileForm mode="register" departments={departments} initial={{ firstName: "", lastName: "", department: "" }} />
    </div>
  );
}
