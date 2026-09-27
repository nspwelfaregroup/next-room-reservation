import { BackButtonSkeleton } from "@/components/BackButton";
import { FormSkeleton, TitleSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <BackButtonSkeleton />
      <TitleSkeleton />
      <FormSkeleton fields={4} />
      <FormSkeleton fields={3} />
    </div>
  );
}
