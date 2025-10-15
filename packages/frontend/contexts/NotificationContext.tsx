'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showLoading: (message: string, title?: string) => void;
  dismissAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast, dismiss } = useToast();

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || 'הצלחה',
        description: message,
        variant: 'default',
        duration: 4000,
      });
    },
    [toast],
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || 'שגיאה',
        description: message,
        variant: 'destructive',
        duration: 6000,
      });
    },
    [toast],
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || 'אזהרה',
        description: message,
        variant: 'default',
        duration: 5000,
      });
    },
    [toast],
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || 'מידע',
        description: message,
        variant: 'default',
        duration: 4000,
      });
    },
    [toast],
  );

  const showLoading = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || 'טוען...',
        description: message,
        variant: 'default',
        duration: Infinity, // Don't auto-dismiss loading toasts
      });
    },
    [toast],
  );

  const dismissAll = useCallback(() => {
    dismiss();
  }, [dismiss]);

  const value: NotificationContextType = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismissAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
}
