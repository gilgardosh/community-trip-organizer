'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export function AuthStatus() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Badge variant="outline">
        <Loader2 className="h-3 w-3 ml-1 animate-spin" />
        טוען...
      </Badge>
    );
  }

  if (!isAuthenticated) {
    return <Badge variant="secondary">לא מחובר</Badge>;
  }

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'super_admin':
        return <Badge variant="destructive">מנהל מערכת</Badge>;
      case 'trip_admin':
        return <Badge className="bg-orange-500">מנהל טיול</Badge>;
      case 'family':
        return <Badge className="bg-green-500">משפחה</Badge>;
      default:
        return <Badge>משתמש</Badge>;
    }
  };

  return getRoleBadge();
}
