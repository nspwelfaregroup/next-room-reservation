import { CardSkeleton, FormSkeleton, TitleSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <TitleSkeleton />
      <CardSkeleton lines={3} />
      <FormSkeleton fields={3} />
    </div>
  );
}
