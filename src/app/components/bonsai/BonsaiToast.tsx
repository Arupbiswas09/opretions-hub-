import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../ui/utils';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: (id: string) => void;
}

function Toast({ id, type, message, onClose }: ToastProps) {
  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      className: 'bg-green-50 text-green-800 border-green-200',
      iconColor: 'text-green-500',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      className: 'bg-red-50 text-red-800 border-red-200',
      iconColor: 'text-red-500',
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      className: 'bg-blue-50 text-blue-800 border-blue-200',
      iconColor: 'text-blue-500',
    },
  }[type];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-md",
        config.className
      )}
    >
      <div className={config.iconColor}>{config.icon}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="p-1 hover:bg-black/5 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface BonsaiToastContainerProps {
  toasts: Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>;
  onClose: (id: string) => void;
}

export function BonsaiToastContainer({ toasts, onClose }: BonsaiToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}

// Hook to manage toasts
export function useBonsaiToast() {
  const [toasts, setToasts] = React.useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    closeToast,
    success: (message: string) => showToast('success', message),
    error: (message: string) => showToast('error', message),
    info: (message: string) => showToast('info', message),
  };
}
