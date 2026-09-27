import SkeletonList from "@/components/SkeletonList";
import { Bone } from "@/components/Skeletons";

// loading.tsx = Suspense fallback ของทั้ง route — Next แสดงทันทีตอนกดเปลี่ยนหน้า ระหว่างรอ server
export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl p-5 shadow-md animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-[55px] h-[55px] rounded-full bg-white/30" />
          <div className="space-y-2">
            <div className="h-3 w-12 bg-white/30 rounded" />
            <div className="h-6 w-40 bg-white/30 rounded" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-9 w-36 bg-white/40 rounded-full" />
          <div className="h-9 w-28 bg-white/20 rounded-full" />
        </div>
      </div>
      <section className="space-y-2">
        <Bone className="h-5 w-48" />
        <SkeletonList count={2} />
      </section>
      <section className="space-y-2">
        <Bone className="h-5 w-40" />
        <SkeletonList count={3} showUser />
      </section>
    </div>
  );
}
