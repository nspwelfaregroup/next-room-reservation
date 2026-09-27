"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";
import { updateProfile } from "@/actions/profile";
import type { ProfileInput } from "@/actions/validate";
import { getIDTokenLiff } from "@/lib/liff";
import { useLiff } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import type { Department } from "@/types/types";

type Props = {
  mode: "register" | "edit";
  departments: Department[];
  initial: ProfileInput;
};

/** ฟอร์มชื่อ นามสกุล แผนก — ใช้ทั้งหน้าลงทะเบียนและหน้าโปรไฟล์ */
export default function ProfileForm({ mode, departments, initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const { setUser } = useLiff();
  const [form, setForm] = useState<ProfileInput>(initial);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const set = (key: keyof ProfileInput, value: string) => {
    setError("");
    setForm((f) => ({ ...f, [key]: value }));
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (mode === "register") {
          const idToken = getIDTokenLiff();
          if (!idToken) return; // กำลัง redirect ไป LINE login
          const res = await registerUser(idToken, form);
          if (!res.ok) return setError(res.error);
          setUser(res.data);
          toast.push("ลงทะเบียนสำเร็จ ยินดีต้อนรับ!");
          router.replace("/");
        } else {
          const res = await updateProfile(form);
          if (!res.ok) return setError(res.error);
          setUser(res.data);
          toast.push("บันทึกข้อมูลแล้ว");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    });
  }

  const dirty = form.firstName !== initial.firstName || form.lastName !== initial.lastName || form.department !== initial.department;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="card p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="firstName">
              ชื่อ
            </label>
            <input id="firstName" className="input" value={form.firstName} maxLength={100} onChange={(e) => set("firstName", e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="lastName">
              นามสกุล
            </label>
            <input id="lastName" className="input" value={form.lastName} maxLength={100} onChange={(e) => set("lastName", e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="department">
            แผนก
          </label>
          <select id="department" className="input" value={form.department} onChange={(e) => set("department", e.target.value)} required>
            <option value="">-- เลือกแผนก --</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}

      <button type="submit" className="btn btn-primary w-full" disabled={pending || (mode === "edit" && !dirty)}>
        {pending ? "กำลังบันทึก..." : mode === "register" ? "ลงทะเบียน" : "บันทึก"}
      </button>
    </form>
  );
}
