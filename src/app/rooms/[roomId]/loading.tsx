import SkeletonList from "@/components/SkeletonList";
import { Bone, DateNavSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Bone className="h-4 w-20" />
        <Bone className="h-7 w-48" />
        <Bone className="h-4 w-32" />
      </div>
      <DateNavSkeleton />
      <Bone className="h-5 w-40" />
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <Bone key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <SkeletonList count={3} showUser />
    </div>
  );
}
