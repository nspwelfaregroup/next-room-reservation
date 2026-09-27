import { BackButtonSkeleton } from "@/components/BackButton";
import { Bone } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <BackButtonSkeleton />
      <div className="card p-5 space-y-4 animate-pulse">
        <div className="flex justify-between">
          <div className="h-6 w-2/3 bg-gray-300 rounded" />
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </div>
        ))}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <Bone className="h-10 flex-1 rounded-xl" />
        <Bone className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
}
