import { Bone, FormSkeleton, TitleSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <TitleSkeleton />
      <Bone className="h-12 w-full rounded-2xl" />
      <FormSkeleton fields={4} />
      <FormSkeleton fields={3} />
    </div>
  );
}
