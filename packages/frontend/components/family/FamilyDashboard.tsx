'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/alert';
import { LoadingDashboard } from '@/components/layout/LoadingStates';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/hooks/use-data';
import { getFamilyById } from '@/lib/api';
import type { Family } from '@/types/family';
import FamilyProfileView from './FamilyProfileView';
import FamilyProfileEdit from './FamilyProfileEdit';
import AdultsManagement from './AdultsManagement';
import ChildrenManagement from './ChildrenManagement';
import { Edit, AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface FamilyDashboardProps {
  familyId: string;
}

export default function FamilyDashboard({ familyId }: FamilyDashboardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { refreshTriggers } = useApp();

  // Memoize fetcher function to prevent infinite loops
  const fetchFamily = useCallback(() => getFamilyById(familyId), [familyId]);

  const {
    data: family,
    isLoading,
    error,
    refresh: refreshFamily,
  } = useData<Family>(fetchFamily, {
    autoRefresh: true,
    refreshInterval: 120000, // Refresh every 2 minutes
  });

  // Refresh when triggers change
  useEffect(() => {
    if (refreshTriggers.families) {
      refreshFamily();
    }
  }, [refreshTriggers.families, refreshFamily]);

  const handleEditSuccess = (updatedFamily: Family) => {
    refreshFamily();
    setIsEditing(false);
  };

  if (isLoading) {
    return <LoadingDashboard />;
  }

  if (error || !family) {
    return (
      <div className="p-4" dir="rtl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          {error?.message || 'לא נמצאו נתוני משפחה'}
        </Alert>
        <Button onClick={refreshFamily} className="mt-4">
          נסה שוב
        </Button>
      </div>
    );
  }

  const adults = family.members.filter((m) => m.type === 'ADULT');
  const children = family.members.filter((m) => m.type === 'CHILD');

  return (
    <div className="space-y-6 p-4" dir="rtl">
      {/* Status Banner */}
      {family.status === 'PENDING' && (
        <Alert>
          <Clock className="h-4 w-4" />
          <div>
            <h4 className="font-semibold">בקשת ההצטרפות שלך ממתינה לאישור</h4>
            <p className="text-sm text-muted-foreground mt-1">
              מנהל המערכת יבדוק את הבקשה ויאשר אותה בהקדם. תקבל הודעה לאחר
              האישור.
            </p>
          </div>
        </Alert>
      )}

      {family.status === 'APPROVED' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <div>
            <h4 className="font-semibold">המשפחה שלך אושרה!</h4>
            <p className="text-sm text-muted-foreground mt-1">
              כעת תוכל להירשם לטיולים ולנהל את פרטי המשפחה.
            </p>
          </div>
        </Alert>
      )}

      {!family.isActive && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-semibold">המשפחה שלך אינה פעילה</h4>
            <p className="text-sm text-muted-foreground mt-1">
              המשפחה שלך הושבתה. אנא צור קשר עם מנהל המערכת לפרטים נוספים.
            </p>
          </div>
        </Alert>
      )}

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">סקירה</TabsTrigger>
          <TabsTrigger value="adults">מבוגרים</TabsTrigger>
          <TabsTrigger value="children">ילדים</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {isEditing ? (
            <FamilyProfileEdit
              family={family}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              <div className="flex justify-end">
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="h-4 w-4 ml-2" />
                  ערוך פרטי משפחה
                </Button>
              </div>
              <FamilyProfileView family={family} />
            </>
          )}
        </TabsContent>

        <TabsContent value="adults">
          <AdultsManagement
            familyId={familyId}
            adults={adults}
            onUpdate={refreshFamily}
          />
        </TabsContent>

        <TabsContent value="children">
          <ChildrenManagement
            familyId={familyId}
            childMembers={children}
            onUpdate={refreshFamily}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">סטטיסטיקות מהירות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {family.members.length}
              </div>
              <div className="text-sm text-muted-foreground">
                סה&quot;כ חברי משפחה
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {adults.length}
              </div>
              <div className="text-sm text-muted-foreground">מבוגרים</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {children.length}
              </div>
              <div className="text-sm text-muted-foreground">ילדים</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
