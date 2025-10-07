'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FamilyListing } from '@/components/family';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default function AdminFamiliesPage() {
  const { user } = useAuth();
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      setDescription('צפייה וחיפוש בכל המשפחות הרשומות במערכת');
    } else if (user?.role === 'TRIP_ADMIN') {
      setDescription('צפייה במשפחות המשתתפות בטיולים שאתה מנהל');
    }
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['TRIP_ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-background p-6" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-4">
          {user?.role === 'TRIP_ADMIN' && (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                כמנהל טיול, אתה רואה רק משפחות המשתתפות בטיולים שאתה מנהל
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">ניהול משפחות</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <FamilyListing />
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
