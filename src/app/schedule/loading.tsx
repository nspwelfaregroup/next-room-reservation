import { DateNavSkeleton, TabsSkeleton, TimelineSkeleton, TitleSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <TitleSkeleton />
      <TabsSkeleton count={2} />
      <DateNavSkeleton />
      <TimelineSkeleton />
    </div>
  );
}
