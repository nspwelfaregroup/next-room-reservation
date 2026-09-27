import { CardSkeleton, FormSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4 pt-2">
      <CardSkeleton lines={2} />
      <FormSkeleton fields={3} />
    </div>
  );
}
