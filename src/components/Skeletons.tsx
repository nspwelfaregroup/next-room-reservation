import clsx from "clsx";
import SkeletonList from "./SkeletonList";

// ชิ้นส่วน skeleton ที่ใช้ประกอบเป็นหน้า loading.tsx ของแต่ละ route

export function Bone({ className }: { className?: string }) {
  return <div className={clsx("bg-gray-200 rounded animate-pulse", className)} />;
}

export function TitleSkeleton({ action }: { action?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <Bone className="h-7 w-40" />
      {action && <Bone className="h-8 w-16 rounded-xl" />}
    </div>
  );
}

export function CardSkeleton({ lines = 2, className }: { lines?: number; className?: string }) {
  return (
    <div className={clsx("card p-4 space-y-2 animate-pulse", className)}>
      <div className="h-4 w-1/2 bg-gray-300 rounded" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className="h-3 w-4/5 bg-gray-200 rounded" />
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="card p-4 space-y-4 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-100 border border-gray-200 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function TabsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="card p-1 flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={clsx("flex-1 h-9 rounded-xl animate-pulse", i === 0 ? "bg-blue-200" : "bg-gray-100")} />
      ))}
    </div>
  );
}

export function DateNavSkeleton() {
  return (
    <div className="card p-3 space-y-2 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-9 bg-gray-100 rounded-xl" />
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-8 w-9 bg-gray-100 rounded-xl" />
      </div>
      <div className="h-9 w-full bg-gray-100 rounded-xl" />
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="card p-3 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="w-10" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 h-8 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-2 h-80">
        <div className="w-10 space-y-8 pt-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 w-8 bg-gray-100 rounded" />
          ))}
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 bg-gray-50 rounded-lg relative">
            <div className="absolute inset-x-1 bg-blue-100 rounded-md" style={{ top: `${15 + i * 20}%`, height: `${12 + i * 4}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** skeleton สำเร็จรูป: หัวข้อ + รายการการ์ด */
export function ListPageSkeleton({ tabs, count = 4, showUser }: { tabs?: boolean; count?: number; showUser?: boolean }) {
  return (
    <div className="space-y-4">
      <TitleSkeleton action={tabs} />
      {tabs && <TabsSkeleton />}
      <SkeletonList count={count} showUser={showUser} />
    </div>
  );
}
