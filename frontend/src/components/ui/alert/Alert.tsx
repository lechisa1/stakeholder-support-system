import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface AlertProps {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
  autoDismiss?: boolean;
  dismissTimeout?: number; // ms
  onDismiss?: () => void;
  showCloseButton?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  showLink = false,
  linkHref = "#",
  linkText = "Learn more",
  autoDismiss = true,
  dismissTimeout = 5000,
  onDismiss,
  showCloseButton = true,
}) => {
  const [visible, setVisible] = useState(true);

  // Handle auto-dismiss
  useEffect(() => {
    if (!autoDismiss) return;
    const timer = setTimeout(() => {
      handleClose();
    }, dismissTimeout);
    return () => clearTimeout(timer);
  }, [autoDismiss, dismissTimeout]);

  const handleClose = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!visible) return null;

  const variantClasses = {
    success: {
      container:
        "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/15",
      icon: "text-emerald-600 dark:text-emerald-400",
      title: "text-emerald-900 dark:text-emerald-100",
      text: "text-emerald-800 dark:text-emerald-300",
      link: "text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300",
    },
    error: {
      container:
        "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/15",
      icon: "text-red-600 dark:text-red-400",
      title: "text-red-900 dark:text-red-100",
      text: "text-red-800 dark:text-red-300",
      link: "text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300",
    },
    warning: {
      container:
        "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/15",
      icon: "text-amber-600 dark:text-amber-400",
      title: "text-amber-900 dark:text-amber-100",
      text: "text-amber-800 dark:text-amber-300",
      link: "text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300",
    },
    info: {
      container:
        "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/15",
      icon: "text-blue-600 dark:text-blue-400",
      title: "text-blue-900 dark:text-blue-100",
      text: "text-blue-800 dark:text-blue-300",
      link: "text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300",
    },
  };

  const icons = {
    success: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`relative flex items-start gap-3 p-4 pr-12 rounded-lg border shadow-md transition-all duration-300 animate-fadeIn ${variantClasses[variant].container}`}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 mt-0.5 ${variantClasses[variant].icon}`}>
        {icons[variant]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm font-semibold ${variantClasses[variant].title}`}
        >
          {title}
        </h4>
        <p className={`text-sm ${variantClasses[variant].text}`}>{message}</p>
        {showLink && (
          <Link
            to={linkHref}
            className={`mt-2 text-sm font-medium underline inline-block ${variantClasses[variant].link}`}
          >
            {linkText}
          </Link>
        )}
      </div>

      {/* Close button */}
      {showCloseButton && (
        <button
          onClick={handleClose}
          className={`absolute top-2 right-2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 ${variantClasses[variant].text}`}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}

      {/* Progress bar */}
      {autoDismiss && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-black/10 dark:bg-white/10 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-current rounded-b-lg transition-all"
            style={{
              animation: `progress ${dismissTimeout}ms linear forwards`,
            }}
          ></div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Alert;
