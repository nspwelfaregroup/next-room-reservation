"use client";

import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { getLineProfile } from "@/lib/liff";

/** แสดงบัญชี LINE ที่กำลังจะลงทะเบียน (หน้า /register แสดงหลัง liff.init เสร็จแล้วเสมอ) */
export default function LineProfilePreview() {
  const [profile, setProfile] = useState<{ displayName: string; pictureUrl: string } | null>(null);

  useEffect(() => {
    getLineProfile()
      .then(setProfile)
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="card p-4 flex items-center gap-3">
      {profile ? (
        <>
          <Avatar src={profile.pictureUrl} name={profile.displayName} size={48} />
          <div className="min-w-0">
            <div className="text-xs text-gray-500">บัญชี LINE</div>
            <div className="font-semibold truncate">{profile.displayName}</div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      )}
    </div>
  );
}
