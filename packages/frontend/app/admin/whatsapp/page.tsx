'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ManualMessageTrigger,
  MessageHistory,
  TemplateManagement,
} from '@/components/whatsapp';
import { useAuth } from '@/contexts/AuthContext';

interface WhatsAppDashboardProps {
  tripId?: string;
  tripName?: string;
}

/**
 * WhatsAppDashboard component
 * Complete dashboard for WhatsApp message management
 * Can be used in trip admin panel or super admin panel
 */
export default function WhatsAppDashboard({
  tripId,
  tripName,
}: WhatsAppDashboardProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isTripAdmin = user?.role === 'TRIP_ADMIN' || isSuperAdmin;

  // If showing for a specific trip
  if (tripId && tripName) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ניהול הודעות וואטסאפ</h1>
          <p className="text-muted-foreground mt-2">
            שלח הודעות לקבוצת הוואטסאפ של הטיול
          </p>
        </div>

        <Tabs defaultValue="manual" className="space-y-6" dir="rtl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">שליחת הודעה</TabsTrigger>
            <TabsTrigger value="history">היסטוריה</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>שלח הודעת וואטסאפ</CardTitle>
                <CardDescription>
                  בחר סוג הודעה, צור את ההודעה והעתק אותה לוואטסאפ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ManualMessageTrigger tripId={tripId} tripName={tripName} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <MessageHistory tripId={tripId} tripName={tripName} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Super admin template management view
  if (isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ניהול תבניות וואטסאפ</h1>
          <p className="text-muted-foreground mt-2">
            צור וערוך תבניות להודעות וואטסאפ אוטומטיות וידניות
          </p>
        </div>

        <TemplateManagement canEdit={true} />
      </div>
    );
  }

  // Trip admin view of templates (read-only)
  if (isTripAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">תבניות הודעות</h1>
          <p className="text-muted-foreground mt-2">
            צפה בתבניות הזמינות להודעות וואטסאפ
          </p>
        </div>

        <TemplateManagement canEdit={false} />
      </div>
    );
  }

  // No permission
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-muted-foreground">אין לך הרשאה לצפות בעמוד זה</p>
      </CardContent>
    </Card>
  );
}
