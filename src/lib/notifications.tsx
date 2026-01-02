import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

export interface NotificationOptions {
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  action?: {
    label: string;
    onClick: () => void;
  };
}

class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  success(message: string, options?: NotificationOptions) {
    return toast.success(message, {
      icon: <CheckCircle className="w-4 h-4" />,
      ...options
    });
  }

  error(message: string, options?: NotificationOptions) {
    return toast.error(message, {
      icon: <XCircle className="w-4 h-4" />,
      ...options
    });
  }

  warning(message: string, options?: NotificationOptions) {
    return toast.warning(message, {
      icon: <AlertTriangle className="w-4 h-4" />,
      ...options
    });
  }

  info(message: string, options?: NotificationOptions) {
    return toast.info(message, {
      icon: <Info className="w-4 h-4" />,
      ...options
    });
  }

  // Error handling specific methods
  handleNetworkError(error: Error, retryFn?: () => void) {
    return this.error('Network error occurred. Please check your connection.', {
      action: retryFn ? {
        label: 'Retry',
        onClick: retryFn
      } : undefined,
      duration: 5000
    });
  }

  handleValidationError(errors: Record<string, string>) {
    const errorMessages = Object.values(errors);
    const message = errorMessages.length > 1 
      ? `${errorMessages.length} validation errors occurred`
      : errorMessages[0];

    return this.error(message, {
      duration: 4000
    });
  }

  handleAuthError(message: string, loginAction?: () => void) {
    return this.error(message, {
      action: loginAction ? {
        label: 'Sign In',
        onClick: loginAction
      } : undefined,
      duration: 5000
    });
  }

  handleSuccess(message: string, action?: { label: string; onClick: () => void }) {
    return this.success(message, {
      action,
      duration: 3000
    });
  }

  // Dismiss all notifications
  dismiss() {
    toast.dismiss();
  }

  // Dismiss specific notification
  dismissById(id: string | number) {
    toast.dismiss(id);
  }
}

export const notifications = NotificationService.getInstance();

// React hook for notifications
export function useNotifications() {
  return {
    success: notifications.success.bind(notifications),
    error: notifications.error.bind(notifications),
    warning: notifications.warning.bind(notifications),
    info: notifications.info.bind(notifications),
    handleNetworkError: notifications.handleNetworkError.bind(notifications),
    handleValidationError: notifications.handleValidationError.bind(notifications),
    handleAuthError: notifications.handleAuthError.bind(notifications),
    handleSuccess: notifications.handleSuccess.bind(notifications),
    dismiss: notifications.dismiss.bind(notifications),
    dismissById: notifications.dismissById.bind(notifications)
  };
}