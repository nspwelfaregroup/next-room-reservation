import SkeletonCard from "./SkeletonCard";

export default function SkeletonList({ count = 2, showUser = false }: { count?: number; showUser?: boolean }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showUser={showUser} />
      ))}
    </div>
  );
}
