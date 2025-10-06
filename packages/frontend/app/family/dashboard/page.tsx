'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { UserNav } from '@/components/auth/UserNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function FamilyDashboard() {
  const { user, family } = useAuth()

  return (
    <ProtectedRoute allowedRoles={['family']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">טיולי השכונה</h1>
            <UserNav />
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card>
              <CardHeader>
                <CardTitle>שלום, {user?.name}!</CardTitle>
                <CardDescription>
                  {family?.name ? `משפחת ${family.name}` : 'ברוכים הבאים למערכת'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  כאן תוכל לראות את כל הטיולים הקרובים, לסמן השתתפות ולנהל את פרטי המשפחה שלך.
                </p>
              </CardContent>
            </Card>

            {/* Family Members */}
            {family && family.members && family.members.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>בני המשפחה</CardTitle>
                  <CardDescription>
                    {family.members.length} חברי משפחה רשומים
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {family.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.type === 'adult' ? 'מבוגר' : `ילד, גיל ${member.age}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>פעולות מהירות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="/family/trips"
                    className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
                  >
                    <div className="font-medium">הטיולים שלי</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      צפה בטיולים קרובים וסמן השתתפות
                    </p>
                  </a>
                  <a
                    href="/profile"
                    className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
                  >
                    <div className="font-medium">עריכת פרופיל</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      עדכן את פרטי המשפחה שלך
                    </p>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
