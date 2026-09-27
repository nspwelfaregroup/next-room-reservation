import { BackButtonSkeleton } from "@/components/BackButton";
import { Bone, CardSkeleton, TitleSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <BackButtonSkeleton />
      <TitleSkeleton />
      <div className="card p-4 space-y-3">
        <Bone className="h-4 w-24" />
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Bone key={i} className="h-9 flex-1 rounded-xl" />
          ))}
        </div>
        <Bone className="h-10 w-full rounded-xl" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <CardSkeleton key={i} lines={3} />
        ))}
      </div>
    </div>
  );
}
