import React from 'react';
import { useToast, ToastType } from '@/context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
  info: <Info className="w-5 h-5 text-sky-400 shrink-0" />
};

const BORDERS: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100',
  error: 'border-rose-500/30 bg-rose-950/80 text-rose-100',
  warning: 'border-amber-500/30 bg-amber-950/80 text-amber-100',
  info: 'border-sky-500/30 bg-sky-950/80 text-sky-100'
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[9999] flex flex-col gap-2.5 pointer-events-none"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${BORDERS[toast.type]}`}
          role="alert"
        >
          <div className="pt-0.5">{ICONS[toast.type]}</div>
          <p className="flex-1 text-xs sm:text-sm font-medium leading-snug break-words">
            {toast.message}
          </p>
          <button
            onClick={() => dismissToast(toast.id)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
