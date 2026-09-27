"use client";

import { useEffect, useState } from "react";

/**
 * แสดงปุ่ม "โหลดใหม่" เมื่อหน้าค้างนานเกิน afterMs
 * tag ใช้บอกว่าค้างที่จุดไหน (ช่วยหาสาเหตุเวลาผู้ใช้แจ้งปัญหา)
 */
export default function SlowReloadHint({ afterMs = 10_000, tag }: { afterMs?: number; tag?: string }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), afterMs);
    return () => clearTimeout(timer);
  }, [afterMs]);

  if (!slow) return null;

  return (
    <div className="text-center space-y-2 py-2">
      <div className="text-xs text-gray-400">ใช้เวลานานกว่าปกติ</div>
      <button type="button" onClick={() => window.location.reload()} className="btn btn-outline py-1.5">
        โหลดใหม่
      </button>
      {tag && <div className="text-[10px] text-gray-300">{tag}</div>}
    </div>
  );
}
