"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ToastTone = "neutral" | "success" | "warning" | "error";

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastInput = Omit<ToastMessage, "id">;

type ToastContextValue = {
  pushToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const pushToast = useCallback(
    (toast: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const nextToast: ToastMessage = { id, tone: "neutral", ...toast };

      setToasts((current) => [nextToast, ...current].slice(0, 4));
      timers.current[id] = setTimeout(() => removeToast(id), 3500);
    },
    [removeToast],
  );

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6 sm:w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto rounded-2xl border bg-white p-4 shadow-xl backdrop-blur-sm fade-in",
              toast.tone === "success" && "border-lightGreen",
              toast.tone === "warning" && "border-softPeach",
              toast.tone === "error" && "border-red-200",
              (!toast.tone || toast.tone === "neutral") && "border-borderWarm",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-navy">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-6 text-mutedText">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-full px-2 py-1 text-sm text-mutedText transition hover:bg-warmGrey"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }

  return context;
}
