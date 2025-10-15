'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/types/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`${redirectTo}?returnUrl=${returnUrl}`);
      return;
    }

    // Check role permissions
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect based on user role
      switch (user.role) {
        case 'SUPER_ADMIN':
          router.push('/super-admin');
          break;
        case 'TRIP_ADMIN':
          router.push('/admin');
          break;
        case 'FAMILY':
          router.push('/family');
          break;
        default:
          router.push('/');
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    allowedRoles,
    router,
    pathname,
    redirectTo,
  ]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Not authorized
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  // Authorized - render children
  return <>{children}</>;
}
