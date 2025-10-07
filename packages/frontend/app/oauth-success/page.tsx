'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setStoredTokens } from '@/lib/auth'
import { Loader2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'

export default function OAuthSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processOAuthSuccess = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setError('חסר טוקן אימות')
        return
      }

      try {
        // Store the token
        setStoredTokens({
          accessToken: token,
          refreshToken: token, // Using same token for now, adjust if needed
        })

        // Redirect to family dashboard
        router.push('/family')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה בשמירת הטוקן')
      }
    }

    processOAuthSuccess()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive" className="text-right">
            {error}
          </Alert>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full text-center text-sm text-primary hover:underline"
          >
            חזור לעמוד ההתחברות
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">מסיים את תהליך האימות...</p>
      </div>
    </div>
  )
}
