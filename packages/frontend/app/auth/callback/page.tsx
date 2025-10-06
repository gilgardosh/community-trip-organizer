'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { handleOAuthCallback } from '@/lib/auth'
import { Loader2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code')
      const provider = searchParams.get('provider')
      const returnUrl = searchParams.get('state') || '/family'

      if (!code || !provider) {
        setError('חסרים פרמטרים נדרשים')
        return
      }

      try {
        await handleOAuthCallback(provider, code)
        router.push(returnUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה באימות')
      }
    }

    processCallback()
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
        <p className="text-muted-foreground">מאמת את החשבון שלך...</p>
      </div>
    </div>
  )
}
