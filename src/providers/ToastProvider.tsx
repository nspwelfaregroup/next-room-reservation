"use client";

// Library
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Toast = { id: number; msg: string; kind: "ok" | "err" };
const Ctx = createContext<{
  push: (msg: string, kind?: "ok" | "err") => void;
} | null>(null);

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((msg: string, kind: "ok" | "err" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 space-y-2 w-[90%] max-w-md">
        {toasts.map((t) => (
          <div key={t.id} className={"shadow-lg rounded-lg px-4 py-3 text-sm text-white " + (t.kind === "ok" ? "bg-emerald-600" : "bg-red-600")}>
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast requires provider");
  return c;
}
