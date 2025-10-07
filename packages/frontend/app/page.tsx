'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, MapPin, Shield } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/family')
    }
  }, [isAuthenticated, isLoading, router])

  // During SSR and initial hydration, always show the landing page content
  // to avoid hydration mismatch
  if (!isMounted || isLoading) {
    // Show landing page content immediately to avoid hydration mismatch
    // The redirect will happen after mount if user is authenticated
  }

  if (isMounted && !isLoading && isAuthenticated) {
    return null // Will redirect to /family
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">טיולי השכונה</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            מערכת ניהול טיולים משפחתיים חכמה ופשוטה
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => router.push('/auth/login')}>
              התחבר עכשיו
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/auth/login?tab=register')}>
              הירשם כעת
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Calendar className="w-12 h-12 mb-4 text-primary" />
              <CardTitle className="text-right">תכנון טיולים</CardTitle>
              <CardDescription className="text-right">
                תכננו וארגנו טיולים משפחתיים בקלות
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-12 h-12 mb-4 text-primary" />
              <CardTitle className="text-right">ניהול משתתפים</CardTitle>
              <CardDescription className="text-right">
                עקבו אחרי המשתתפים והרשמות לטיולים
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="w-12 h-12 mb-4 text-primary" />
              <CardTitle className="text-right">יעדי טיול</CardTitle>
              <CardDescription className="text-right">
                גלו יעדים מומלצים לטיולים משפחתיים
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-12 h-12 mb-4 text-primary" />
              <CardTitle className="text-right">ניהול הרשאות</CardTitle>
              <CardDescription className="text-right">
                מערכת הרשאות מתקדמת לניהול בטוח
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">מוכנים להתחיל?</h2>
              <p className="text-muted-foreground mb-6">
                הצטרפו לקהילת ההורים המתכננים טיולים משפחתיים מהנים ומאורגנים
              </p>
              <Button size="lg" onClick={() => router.push('/auth/login')}>
                כניסה למערכת
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 טיולי השכונה. כל הזכויות שמורות.</p>
            <div className="flex gap-6">
              <a href="/terms" className="hover:text-primary transition-colors">
                תנאי שימוש
              </a>
              <a href="/privacy" className="hover:text-primary transition-colors">
                מדיניות פרטיות
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
