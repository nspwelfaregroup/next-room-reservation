import SkeletonList from "@/components/SkeletonList";
import { BackButtonSkeleton } from "@/components/BackButton";
import { Bone, DateNavSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <BackButtonSkeleton />
      <div className="space-y-2">
        <Bone className="h-7 w-48" />
        <Bone className="h-4 w-32" />
      </div>
      <DateNavSkeleton />
      <Bone className="h-5 w-40" />
      <SkeletonList count={3} showUser />
    </div>
  );
}
