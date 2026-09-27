import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card p-8 text-center space-y-3 mt-10">
      <div className="text-4xl">🔍</div>
      <div className="font-semibold text-gray-900">ไม่พบหน้าที่ต้องการ</div>
      <div className="text-sm text-gray-500">ข้อมูลอาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</div>
      <Link href="/" className="btn btn-primary">
        กลับหน้าแรก
      </Link>
    </div>
  );
}
