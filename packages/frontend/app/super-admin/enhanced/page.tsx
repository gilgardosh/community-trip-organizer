'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  MapPin,
  Shield,
  Activity,
  Download,
  BarChart3,
  UserCog,
} from 'lucide-react';
import {
  UserRoleManagement,
  FamilyApprovalWorkflow,
  ActivityLogsViewer,
  SystemReporting,
  DataExport,
} from '@/components/admin';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function EnhancedSuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                פאנל סופר אדמין
              </h1>
              <p className="text-muted-foreground">
                ניהול מערכת טיולי השכונה - פאנל ניהול מתקדם
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>SA</AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium">אדמין ראשי</p>
                <p className="text-xs text-muted-foreground">סופר אדמין</p>
              </div>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">סקירה</span>
              </TabsTrigger>
              <TabsTrigger value="families" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">משפחות</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                <span className="hidden sm:inline">משתמשים</span>
              </TabsTrigger>
              <TabsTrigger value="trips" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">טיולים</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">לוגים</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">דוחות</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">ייצוא</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>ברוך הבא לפאנל הניהול</CardTitle>
                  <CardDescription>
                    סקירה כללית של המערכת ופעולות נפוצות
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setActiveTab('families')}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              אישור משפחות
                            </CardTitle>
                            <CardDescription>
                              אשר משפחות חדשות המבקשות להצטרף
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    <Card
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setActiveTab('users')}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-secondary/10 rounded-lg">
                            <UserCog className="h-6 w-6 text-secondary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              ניהול תפקידים
                            </CardTitle>
                            <CardDescription>
                              עדכן תפקידי משתמשים והרשאות
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    <Card
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setActiveTab('logs')}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Activity className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              לוג פעילות
                            </CardTitle>
                            <CardDescription>
                              צפה בפעולות שבוצעו במערכת
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    <Card
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setActiveTab('export')}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <Download className="h-6 w-6 text-green-500" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              ייצוא נתונים
                            </CardTitle>
                            <CardDescription>
                              ייצא נתונים לגיבוי או ניתוח
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* System Statistics Preview */}
              <SystemReporting />
            </TabsContent>

            {/* Families Tab */}
            <TabsContent value="families" className="space-y-6">
              <FamilyApprovalWorkflow />
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <UserRoleManagement />
            </TabsContent>

            {/* Trips Tab */}
            <TabsContent value="trips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>ניהול טיולים</CardTitle>
                  <CardDescription>
                    לניהול טיולים מפורט, עבור לדף הטיולים הראשי
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    ניהול טיולים, שיוך מנהלים ופרסום טיולים מתבצע בדף הטיולים
                    המתקדם. השתמש בטאב "טיולים" בתפריט הראשי לגישה לפונקציונליות
                    מלאה.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="logs" className="space-y-6">
              <ActivityLogsViewer />
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <SystemReporting />
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-6">
              <DataExport />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
