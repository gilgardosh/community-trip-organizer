'use client'

import { FamilyRegistrationForm } from '@/components/family'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">הרשמת משפחה חדשה</CardTitle>
            <CardDescription>
              צור חשבון חדש למשפחה שלך כדי להצטרף לטיולי הקהילה
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FamilyRegistrationForm />
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                כבר יש לך חשבון?{' '}
                <Link href="/auth/login" className="text-primary hover:underline">
                  התחבר כאן
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
