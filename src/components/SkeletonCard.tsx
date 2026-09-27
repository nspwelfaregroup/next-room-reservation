function SkeletonCard({ showUser }: { showUser?: boolean }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3 items-center animate-pulse">
      <div className="w-14 flex flex-col items-center gap-1">
        <div className="h-3 w-8 bg-gray-200 rounded" />
        <div className="h-5 w-10 bg-gray-300 rounded" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 w-3/5 bg-gray-300 rounded" />
        <div className="h-3 w-4/5 bg-gray-200 rounded" />
        {showUser && <div className="h-3 w-2/5 bg-gray-200 rounded" />}
      </div>
    </div>
  );
}

export default SkeletonCard;
