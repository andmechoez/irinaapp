import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface AlertBannerProps {
  message: string;
  detail?: string;
  variant?: 'warning' | 'danger' | 'info' | 'success';
  dismissible?: boolean;
  onClose?: () => void;
}

const variantStyles = {
  warning: {
    bg: 'bg-salud-amber-soft border-salud-amber/30',
    icon: 'text-salud-amber',
    text: 'text-amber-900',
  },
  danger: {
    bg: 'bg-salud-red-soft border-salud-red/30',
    icon: 'text-salud-red',
    text: 'text-red-900',
  },
  info: {
    bg: 'bg-salud-blue-soft border-salud-blue/30',
    icon: 'text-salud-blue',
    text: 'text-blue-900',
  },
  success: {
    bg: 'bg-green-50 border-green-200',
    icon: 'text-green-500',
    text: 'text-green-900',
  },
};

export default function AlertBanner({
  message,
  detail,
  variant = 'warning',
  dismissible = false,
  onClose,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const styles = variantStyles[variant];

  if (!isVisible) return null;

  return (
    <div
      className={`
        ${styles.bg} border rounded-[var(--radius-md)]
        p-4 flex items-start gap-3
        animate-slide-up
      `}
      role="alert"
    >
      <AlertTriangle
        size={22}
        className={`${styles.icon} flex-shrink-0 mt-0.5`}
      />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-base ${styles.text}`}>{message}</p>
        {detail && (
          <p className={`text-sm mt-1 ${styles.text} opacity-80`}>{detail}</p>
        )}
      </div>
      {dismissible && (
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="text-text-tertiary hover:text-text-primary transition-colors p-1 -mr-1"
          aria-label="Cerrar alerta"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
