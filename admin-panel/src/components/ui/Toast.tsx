import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextValue {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={clsx(
              'flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-[fadeIn_0.2s_ease]',
              toast.type === 'success'
                ? 'bg-[rgba(111,168,154,0.14)] border-[rgba(111,168,154,0.3)] text-[var(--color-text)]'
                : 'bg-[rgba(224,112,92,0.1)] border-[rgba(224,112,92,0.3)] text-[var(--color-text)]'
            )}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} className="text-[var(--color-success)] shrink-0 mt-0.5" />
            ) : (
              <XCircle size={18} className="text-[var(--color-danger)] shrink-0 mt-0.5" />
            )}
            <span className="text-sm flex-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
