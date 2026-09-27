import { CardSkeleton, TabsSkeleton, TitleSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <TitleSkeleton />
      <TabsSkeleton count={2} />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <CardSkeleton key={i} lines={3} />
        ))}
      </div>
    </div>
  );
}
