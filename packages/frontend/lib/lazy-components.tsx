/**
 * Lazy Loading Utilities for Code Splitting
 * Provides dynamic imports for heavy components
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Loading component for lazy loaded modules
 */
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
};

/**
 * Error fallback for lazy loading failures
 */
const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
      <p className="text-sm text-destructive">
        שגיאה בטעינת הרכיב: {error.message}
      </p>
    </div>
  );
};

/**
 * Lazy load component with loading state
 */
export function lazyLoad<T extends ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  },
) {
  return dynamic(importFunc, {
    loading: options?.loading || LoadingSpinner,
    ssr: options?.ssr ?? true,
  });
}

// ===== Admin Components (Heavy) =====
export const LazyAdminDashboard = lazyLoad(
  () => import('../components/admin/AdminDashboard'),
  { ssr: false },
);

export const LazyAdminFamilyManagement = lazyLoad(
  () => import('@/components/admin/AdminFamilyManagement'),
  { ssr: false },
);

export const LazyAdminTripApproval = lazyLoad(
  () => import('@/components/admin/AdminTripApproval'),
  { ssr: false },
);

export const LazyAdminUserManagement = lazyLoad(
  () => import('@/components/admin/AdminUserManagement'),
  { ssr: false },
);

// ===== Trip Components =====
export const LazyTripDetails = lazyLoad(
  () => import('@/components/trip/TripDetails'),
);

export const LazyTripForm = lazyLoad(
  () => import('@/components/trip/TripForm'),
  {
    ssr: false,
  },
);

export const LazyGearAssignment = lazyLoad(
  () => import('@/components/trip/GearAssignment'),
);

export const LazyParticipantsList = lazyLoad(
  () => import('@/components/trip/ParticipantsList'),
);

// ===== WhatsApp Components =====
export const LazyWhatsAppMessageComposer = lazyLoad(
  () => import('@/components/whatsapp/WhatsAppMessageComposer'),
  { ssr: false },
);

export const LazyWhatsAppTemplates = lazyLoad(
  () => import('@/components/whatsapp/WhatsAppTemplates'),
  { ssr: false },
);

// ===== Family Components =====
export const LazyFamilyProfile = lazyLoad(
  () => import('@/components/family/FamilyProfile'),
  { ssr: false },
);

export const LazyFamilyEdit = lazyLoad(
  () => import('@/components/family/FamilyEdit'),
  { ssr: false },
);

// ===== Dashboard Components =====
export const LazyDashboard = lazyLoad(
  () => import('@/components/dashboard/Dashboard'),
);

export const LazyTripList = lazyLoad(
  () => import('@/components/dashboard/TripList'),
);

/**
 * Preload component for critical paths
 */
export function preloadComponent(component: ReturnType<typeof lazyLoad>): void {
  if (typeof window !== 'undefined') {
    // Trigger preload on client side
    component.preload?.();
  }
}

/**
 * Preload on route change or user interaction
 */
export function usePreloadOnHover(component: ReturnType<typeof lazyLoad>): {
  onMouseEnter: () => void;
  onFocus: () => void;
} {
  return {
    onMouseEnter: () => preloadComponent(component),
    onFocus: () => preloadComponent(component),
  };
}
