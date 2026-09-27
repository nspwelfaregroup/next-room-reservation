"use client";

import { useEffect, useState } from "react";

const SLOW_AFTER_MS = 10_000;

export function LoadingScreen({ text = "กำลังโหลด...", detail }: { text?: string; detail?: string }) {
  const [slow, setSlow] = useState(false);

  // โหลดนานผิดปกติ → ให้ผู้ใช้กดโหลดใหม่เองได้ ไม่ต้องปิดแอป
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen grid place-items-center bg-linear-to-br from-blue-50 to-white">
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <div className="text-sm text-gray-500">{text}</div>
        {slow && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400">ใช้เวลานานกว่าปกติ</div>
            <button type="button" onClick={() => window.location.reload()} className="btn btn-outline py-1.5">
              โหลดใหม่
            </button>
            {detail && <div className="text-[10px] text-gray-300">{detail}</div>}
          </div>
        )}
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
        <div className="text-sm text-gray-600 wrap-break-word">{error}</div>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-outline w-full">
            ลองใหม่
          </button>
        )}
      </div>
    </div>
  );
}
