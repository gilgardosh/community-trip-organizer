'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { addFamilyMember, updateFamilyMember, removeFamilyMember } from '@/lib/api'
import { addMemberSchema, updateMemberSchema } from '@/lib/validation'
import type { FamilyMember } from '@/types/family'
import { Baby, Edit, Trash2, Save, X, Calendar } from 'lucide-react'
import { differenceInYears } from 'date-fns'
import { ZodError } from 'zod'

interface ChildrenManagementProps {
  familyId: string
  children: FamilyMember[]
  onUpdate?: () => void
}

export default function ChildrenManagement({ familyId, children, onUpdate }: ChildrenManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<FamilyMember | null>(null)
  const [deletingChild, setDeletingChild] = useState<FamilyMember | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')

  // Add child form state
  const [newChild, setNewChild] = useState({
    name: '',
    age: 0,
  })

  // Edit child form state
  const [editForm, setEditForm] = useState({
    name: '',
    age: 0,
  })

  const resetAddForm = () => {
    setNewChild({
      name: '',
      age: 0,
    })
    setErrors({})
    setGeneralError('')
  }

  const resetEditForm = () => {
    setEditForm({
      name: '',
      age: 0,
    })
    setErrors({})
    setGeneralError('')
  }

  const getAgeLabel = (age: number | undefined) => {
    if (!age) return 'לא צוין'
    if (age === 1) return 'שנה אחת'
    if (age === 2) return 'שנתיים'
    return `${age} שנים`
  }

  const handleAddChild = async () => {
    setErrors({})
    setGeneralError('')
    setIsLoading(true)

    try {
      const formData = {
        type: 'CHILD' as const,
        name: newChild.name,
        age: newChild.age,
      }

      addMemberSchema.parse(formData)

      await addFamilyMember(familyId, formData)

      setIsAddDialogOpen(false)
      resetAddForm()
      onUpdate?.()
    } catch (error: any) {
      if (error instanceof ZodError) {
        const zodErrors: Record<string, string> = {}
        error.issues.forEach((err: any) => {
          const path = err.path.join('.')
          zodErrors[path] = err.message
        })
        setErrors(zodErrors)
      } else {
        setGeneralError(error.message || 'אירעה שגיאה בעת הוספת הילד')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditChild = async () => {
    if (!editingChild) return

    setErrors({})
    setGeneralError('')
    setIsLoading(true)

    try {
      const formData = {
        name: editForm.name || undefined,
        age: editForm.age,
      }

      updateMemberSchema.parse(formData)

      await updateFamilyMember(familyId, editingChild.id, formData)

      setEditingChild(null)
      resetEditForm()
      onUpdate?.()
    } catch (error: any) {
      if (error instanceof ZodError) {
        const zodErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          const path = err.path.join('.')
          zodErrors[path] = err.message
        })
        setErrors(zodErrors)
      } else {
        setGeneralError(error.message || 'אירעה שגיאה בעת עדכון הילד')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChild = async () => {
    if (!deletingChild) return

    setIsLoading(true)
    setGeneralError('')

    try {
      await removeFamilyMember(familyId, deletingChild.id)
      setDeletingChild(null)
      onUpdate?.()
    } catch (error: any) {
      setGeneralError(error.message || 'אירעה שגיאה בעת מחיקת הילד')
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (child: FamilyMember) => {
    setEditingChild(child)
    setEditForm({
      name: child.name,
      age: child.age || 0,
    })
    setErrors({})
    setGeneralError('')
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            ניהול ילדים
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetAddForm}>
                <Baby className="h-4 w-4 ml-2" />
                הוסף ילד
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>הוספת ילד חדש</DialogTitle>
                <DialogDescription>
                  מלא את הפרטים של הילד החדש
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {generalError && <Alert variant="destructive">{generalError}</Alert>}
                
                <div className="space-y-2">
                  <Label htmlFor="new-child-name">שם *</Label>
                  <Input
                    id="new-child-name"
                    value={newChild.name}
                    onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                    placeholder="שם הילד"
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-child-age">גיל *</Label>
                  <Input
                    id="new-child-age"
                    type="number"
                    min="0"
                    max="18"
                    value={newChild.age || ''}
                    onChange={(e) => setNewChild({ ...newChild, age: parseInt(e.target.value) || 0 })}
                    placeholder="0-18"
                  />
                  {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
                  <p className="text-xs text-muted-foreground">
                    יש להזין גיל בין 0 ל-18 שנים
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                  ביטול
                </Button>
                <Button onClick={handleAddChild} disabled={isLoading}>
                  {isLoading ? 'מוסיף...' : 'הוסף'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map((child) => (
            <div key={child.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-semibold">
                {child.name.charAt(0)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-semibold">{child.name}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {getAgeLabel(child.age)}
                  {child.age !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {child.age <= 3 && 'פעוט'}
                      {child.age > 3 && child.age <= 12 && 'ילד'}
                      {child.age > 12 && 'נער'}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(child)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingChild(child)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}

          {children.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground text-center py-8">
              לא נמצאו ילדים. לחץ על &quot;הוסף ילד&quot; כדי להוסיף.
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingChild} onOpenChange={(open) => !open && setEditingChild(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת ילד</DialogTitle>
            <DialogDescription>
              עדכן את פרטי הילד
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {generalError && <Alert variant="destructive">{generalError}</Alert>}
            
            <div className="space-y-2">
              <Label htmlFor="edit-child-name">שם</Label>
              <Input
                id="edit-child-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="שם הילד"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-child-age">גיל</Label>
              <Input
                id="edit-child-age"
                type="number"
                min="0"
                max="18"
                value={editForm.age || ''}
                onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })}
                placeholder="0-18"
              />
              {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
              <p className="text-xs text-muted-foreground">
                יש להזין גיל בין 0 ל-18 שנים
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingChild(null)} disabled={isLoading}>
              <X className="h-4 w-4 ml-2" />
              ביטול
            </Button>
            <Button onClick={handleEditChild} disabled={isLoading}>
              <Save className="h-4 w-4 ml-2" />
              {isLoading ? 'שומר...' : 'שמור'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingChild} onOpenChange={(open) => !open && setDeletingChild(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת ילד</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את {deletingChild?.name}?
            </DialogDescription>
          </DialogHeader>
          {generalError && <Alert variant="destructive">{generalError}</Alert>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingChild(null)} disabled={isLoading}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleDeleteChild} disabled={isLoading}>
              {isLoading ? 'מוחק...' : 'מחק'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
