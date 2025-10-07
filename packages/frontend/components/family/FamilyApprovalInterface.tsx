'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert } from '@/components/ui/alert'
import { approveFamily, deactivateFamily, reactivateFamily, deleteFamily } from '@/lib/api'
import type { Family } from '@/types/family'
import { CheckCircle, XCircle, Eye, Trash2, RotateCcw, Users, UserCheck, Baby, Calendar, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

interface FamilyApprovalInterfaceProps {
  families: Family[]
  onUpdate?: () => void
}

export default function FamilyApprovalInterface({ families, onUpdate }: FamilyApprovalInterfaceProps) {
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'deactivate' | 'reactivate' | 'delete' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAction = async () => {
    if (!selectedFamily || !actionType) return

    setIsLoading(true)
    setError('')

    try {
      switch (actionType) {
        case 'approve':
          await approveFamily(selectedFamily.id)
          break
        case 'deactivate':
          await deactivateFamily(selectedFamily.id)
          break
        case 'reactivate':
          await reactivateFamily(selectedFamily.id)
          break
        case 'delete':
          await deleteFamily(selectedFamily.id)
          break
      }

      setSelectedFamily(null)
      setActionType(null)
      onUpdate?.()
    } catch (err: any) {
      setError(err.message || 'אירעה שגיאה בעת ביצוע הפעולה')
    } finally {
      setIsLoading(false)
    }
  }

  const openActionDialog = (family: Family, action: typeof actionType) => {
    setSelectedFamily(family)
    setActionType(action)
    setError('')
  }

  const closeDialog = () => {
    setSelectedFamily(null)
    setActionType(null)
    setError('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default">מאושר</Badge>
      case 'PENDING':
        return <Badge variant="secondary">ממתין</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getActionTitle = () => {
    switch (actionType) {
      case 'approve':
        return 'אישור משפחה'
      case 'deactivate':
        return 'השבתת משפחה'
      case 'reactivate':
        return 'הפעלת משפחה מחדש'
      case 'delete':
        return 'מחיקת משפחה'
      default:
        return ''
    }
  }

  const getActionDescription = () => {
    if (!selectedFamily) return ''

    switch (actionType) {
      case 'approve':
        return `האם אתה בטוח שברצונך לאשר את ${selectedFamily.name || 'המשפחה'}? לאחר האישור, המשפחה תוכל להירשם לטיולים.`
      case 'deactivate':
        return `האם אתה בטוח שברצונך להשבית את ${selectedFamily.name || 'המשפחה'}? משפחה מושבתת לא תוכל לגשת למערכת.`
      case 'reactivate':
        return `האם אתה בטוח שברצונך להפעיל מחדש את ${selectedFamily.name || 'המשפחה'}?`
      case 'delete':
        return `האם אתה בטוח שברצונך למחוק את ${selectedFamily.name || 'המשפחה'} לצמיתות? פעולה זו לא ניתנת לביטול!`
      default:
        return ''
    }
  }

  const getActionButton = () => {
    switch (actionType) {
      case 'approve':
        return (
          <Button onClick={handleAction} disabled={isLoading}>
            <CheckCircle className="h-4 w-4 ml-2" />
            {isLoading ? 'מאשר...' : 'אשר'}
          </Button>
        )
      case 'deactivate':
        return (
          <Button variant="destructive" onClick={handleAction} disabled={isLoading}>
            <XCircle className="h-4 w-4 ml-2" />
            {isLoading ? 'משבית...' : 'השבת'}
          </Button>
        )
      case 'reactivate':
        return (
          <Button onClick={handleAction} disabled={isLoading}>
            <RotateCcw className="h-4 w-4 ml-2" />
            {isLoading ? 'מפעיל...' : 'הפעל מחדש'}
          </Button>
        )
      case 'delete':
        return (
          <Button variant="destructive" onClick={handleAction} disabled={isLoading}>
            <Trash2 className="h-4 w-4 ml-2" />
            {isLoading ? 'מוחק...' : 'מחק לצמיתות'}
          </Button>
        )
      default:
        return null
    }
  }

  const pendingFamilies = families.filter(f => f.status === 'PENDING')
  const approvedFamilies = families.filter(f => f.status === 'APPROVED' && f.isActive)
  const inactiveFamilies = families.filter(f => !f.isActive)

  return (
    <div className="space-y-6" dir="rtl">
      {/* Pending Families */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            משפחות ממתינות לאישור ({pendingFamilies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingFamilies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              אין משפחות ממתינות לאישור
            </p>
          ) : (
            <div className="space-y-4">
              {pendingFamilies.map((family) => (
                <FamilyCard
                  key={family.id}
                  family={family}
                  onApprove={() => openActionDialog(family, 'approve')}
                  onDeactivate={() => openActionDialog(family, 'deactivate')}
                  onDelete={() => openActionDialog(family, 'delete')}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Families */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            משפחות מאושרות ({approvedFamilies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedFamilies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              אין משפחות מאושרות
            </p>
          ) : (
            <div className="space-y-4">
              {approvedFamilies.map((family) => (
                <FamilyCard
                  key={family.id}
                  family={family}
                  onDeactivate={() => openActionDialog(family, 'deactivate')}
                  onDelete={() => openActionDialog(family, 'delete')}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Families */}
      {inactiveFamilies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              משפחות מושבתות ({inactiveFamilies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inactiveFamilies.map((family) => (
                <FamilyCard
                  key={family.id}
                  family={family}
                  onReactivate={() => openActionDialog(family, 'reactivate')}
                  onDelete={() => openActionDialog(family, 'delete')}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <Dialog open={!!selectedFamily && !!actionType} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>{getActionDescription()}</DialogDescription>
          </DialogHeader>

          {selectedFamily && (
            <div className="space-y-4 py-4">
              <div className="p-4 border rounded-lg space-y-2">
                <div className="font-semibold">{selectedFamily.name || 'משפחה ללא שם'}</div>
                <div className="text-sm text-muted-foreground">
                  מבוגרים: {selectedFamily.members.filter(m => m.type === 'ADULT').length} | 
                  ילדים: {selectedFamily.members.filter(m => m.type === 'CHILD').length}
                </div>
                <div className="text-sm text-muted-foreground">
                  נוצר ב: {format(new Date(selectedFamily.createdAt), 'PPP', { locale: he })}
                </div>
              </div>
            </div>
          )}

          {error && <Alert variant="destructive">{error}</Alert>}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isLoading}>
              ביטול
            </Button>
            {getActionButton()}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface FamilyCardProps {
  family: Family
  onApprove?: () => void
  onDeactivate?: () => void
  onReactivate?: () => void
  onDelete?: () => void
}

function FamilyCard({ family, onApprove, onDeactivate, onReactivate, onDelete }: FamilyCardProps) {
  const adults = family.members.filter(m => m.type === 'ADULT')
  const children = family.members.filter(m => m.type === 'CHILD')

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{family.name || 'משפחה ללא שם'}</h3>
            <Badge variant={family.isActive ? 'default' : 'secondary'}>
              {family.isActive ? 'פעיל' : 'לא פעיל'}
            </Badge>
            <Badge variant={family.status === 'APPROVED' ? 'default' : 'secondary'}>
              {family.status === 'APPROVED' ? 'מאושר' : 'ממתין'}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(family.createdAt), 'PPP', { locale: he })}
            </div>
            <div className="flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              {adults.length} מבוגרים
            </div>
            <div className="flex items-center gap-1">
              <Baby className="h-3 w-3" />
              {children.length} ילדים
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {onApprove && (
            <Button size="sm" onClick={onApprove}>
              <CheckCircle className="h-4 w-4 ml-1" />
              אשר
            </Button>
          )}
          {onReactivate && (
            <Button size="sm" onClick={onReactivate} variant="outline">
              <RotateCcw className="h-4 w-4 ml-1" />
              הפעל מחדש
            </Button>
          )}
          {onDeactivate && (
            <Button size="sm" onClick={onDeactivate} variant="outline">
              <XCircle className="h-4 w-4 ml-1" />
              השבת
            </Button>
          )}
          {onDelete && (
            <Button size="sm" onClick={onDelete} variant="ghost">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      {/* Adults */}
      {adults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">מבוגרים:</h4>
          <div className="space-y-2">
            {adults.map((adult) => (
              <div key={adult.id} className="flex items-center gap-2 text-sm">
                <Avatar className="h-8 w-8">
                  {adult.profilePhotoUrl ? (
                    <img src={adult.profilePhotoUrl} alt={adult.name} />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary text-xs font-semibold">
                      {adult.name.charAt(0)}
                    </div>
                  )}
                </Avatar>
                <span>{adult.name}</span>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {adult.email}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Children */}
      {children.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">ילדים:</h4>
          <div className="flex flex-wrap gap-2">
            {children.map((child) => (
              <Badge key={child.id} variant="outline">
                {child.name} ({child.age} שנים)
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
