export function LoadingScreen({ text = "กำลังโหลด..." }: { text?: string }) {
  return (
    <div className="min-h-screen grid place-items-center bg-linear-to-br from-blue-50 to-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <div className="text-sm text-gray-500">{text}</div>
      </div>
    </div>
  );
}

export function ErrorScreen({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="card p-6 max-w-sm w-full text-center space-y-3">
        <div className="text-3xl">⚠️</div>
        <div className="text-red-600 font-semibold">เกิดข้อผิดพลาด</div>
        <div className="text-sm text-gray-600 wrap-break">{error}</div>
        {onRetry && (
          <button onClick={onRetry} className="btn-outline w-full">
            ลองใหม่
          </button>
        )}
      </div>
    </div>
  );
}
