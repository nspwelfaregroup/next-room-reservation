import { FormSkeleton, TitleSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <TitleSkeleton />
      <FormSkeleton fields={4} />
      <FormSkeleton fields={3} />
    </div>
  );
}
