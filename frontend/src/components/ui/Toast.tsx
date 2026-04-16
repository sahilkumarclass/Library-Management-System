import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; tone: ToastTone; message: string };

type ToastContextValue = {
  toast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, tone, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex min-w-[260px] items-start gap-3 rounded-lg border bg-white p-3 shadow-lg",
              t.tone === "success" && "border-emerald-200",
              t.tone === "error" && "border-red-200",
              t.tone === "info" && "border-slate-200"
            )}
          >
            {t.tone === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />}
            {t.tone === "error" && <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />}
            {t.tone === "info" && <Info className="mt-0.5 h-4 w-4 text-slate-600" />}
            <p className="text-sm text-slate-800">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
