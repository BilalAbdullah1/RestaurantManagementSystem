import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, X, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

let toastCount = 0;
type ToastObserver = (toast: ToastMessage) => void;
const observers: ToastObserver[] = [];

// Global utility to trigger toasts from anywhere
export const toast = {
  success: (message: string) => dispatch({ id: String(++toastCount), type: "success", message }),
  error: (message: string) => dispatch({ id: String(++toastCount), type: "error", message }),
  info: (message: string) => dispatch({ id: String(++toastCount), type: "info", message }),
  warning: (message: string) => dispatch({ id: String(++toastCount), type: "warning", message }),
};

function dispatch(toastMsg: ToastMessage) {
  observers.forEach((observer) => observer(toastMsg));
}

// Mount this component once at the root of your application (e.g., in App.tsx)
export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (newToast: ToastMessage) => {
      setToasts((prev) => [...prev, newToast]);
      // Auto-remove after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3000);
    };

    observers.push(handleToast);
    return () => {
      const index = observers.indexOf(handleToast);
      if (index > -1) observers.splice(index, 1);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 20, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-3 p-4 pr-10 rounded-lg shadow-xl border min-w-[300px] relative bg-white dark:bg-gray-800 ${
              t.type === "success"
                ? "border-green-500/30"
                : t.type === "error"
                ? "border-red-500/30"
                : t.type === "warning"
                ? "border-amber-500/30"
                : "border-blue-500/30"
            }`}
          >
            {t.type === "success" && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
            {t.type === "error" && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
            {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />}
            {t.type === "info" && <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />}
            
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{t.message}</p>
            
            <button
              onClick={() => removeToast(t.id)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
