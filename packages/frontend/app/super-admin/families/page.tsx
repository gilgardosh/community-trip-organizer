'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { FamilyApprovalInterface } from '@/components/family'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getFamilies } from '@/lib/api'
import type { Family } from '@/types/family'

export default function SuperAdminFamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadFamilies = async () => {
    try {
      setIsLoading(true)
      const data = await getFamilies({ status: 'PENDING' })
      setFamilies(data)
    } catch (error) {
      console.error('Failed to load families:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFamilies()
  }, [])

  return (
    <ProtectedRoute allowedRoles={['super_admin']}>
      <div className="min-h-screen bg-background p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">אישור משפחות</CardTitle>
              <CardDescription>
                סקירה ואישור משפחות חדשות שממתינות להצטרפות למערכת
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">טוען...</div>
              ) : (
                <FamilyApprovalInterface families={families} onUpdate={loadFamilies} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
