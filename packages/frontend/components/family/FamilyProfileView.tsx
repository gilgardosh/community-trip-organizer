'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import type { Family } from '@/types/family'
import { Users, UserCheck, Baby, Mail, Calendar, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

interface FamilyProfileViewProps {
  family: Family
}

export default function FamilyProfileView({ family }: FamilyProfileViewProps) {
  const adults = family.members.filter(m => m.type === 'ADULT')
  const children = family.members.filter(m => m.type === 'CHILD')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            מאושר
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            ממתין לאישור
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Family Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6" />
              {family.name || 'משפחה ללא שם'}
            </CardTitle>
            {getStatusBadge(family.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">תאריך הצטרפות:</span>
              <span className="font-medium">
                {format(new Date(family.createdAt), 'PPP', { locale: he })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">מבוגרים:</span>
              <span className="font-medium">{adults.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Baby className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">ילדים:</span>
              <span className="font-medium">{children.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adults Section */}
      {adults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              מבוגרים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adults.map((adult) => (
                <div
                  key={adult.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <Avatar className="h-12 w-12">
                    {adult.profilePhotoUrl ? (
                      <img src={adult.profilePhotoUrl} alt={adult.name} />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-semibold">
                        {adult.name.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{adult.name}</span>
                      {adult.role !== 'FAMILY' && (
                        <Badge variant="secondary" className="text-xs">
                          {adult.role === 'SUPER_ADMIN' ? 'מנהל על' : 'מנהל טיול'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {adult.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Children Section */}
      {children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Baby className="h-5 w-5" />
              ילדים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-semibold">
                    {child.name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="font-semibold">{child.name}</span>
                    <div className="text-sm text-muted-foreground">
                      גיל: {child.age}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty States */}
      {adults.length === 0 && children.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            לא נמצאו חברי משפחה
          </CardContent>
        </Card>
      )}
    </div>
  )
}
