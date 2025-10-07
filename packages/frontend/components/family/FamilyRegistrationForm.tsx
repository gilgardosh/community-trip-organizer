'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { createFamily } from '@/lib/api'
import { createFamilySchema, type CreateFamilyFormData, adultSchema, childSchema } from '@/lib/validation'
import type { CreateAdultData, CreateChildData } from '@/types/family'
import { Plus, X, Users, UserPlus, Baby } from 'lucide-react'
import bcrypt from 'bcryptjs'

export default function FamilyRegistrationForm() {
  const router = useRouter()
  const [familyName, setFamilyName] = useState('')
  const [adults, setAdults] = useState<CreateAdultData[]>([
    { name: '', email: '', password: '', profilePhotoUrl: '' }
  ])
  const [children, setChildren] = useState<CreateChildData[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const addAdult = () => {
    setAdults([...adults, { name: '', email: '', password: '', profilePhotoUrl: '' }])
  }

  const removeAdult = (index: number) => {
    if (adults.length > 1) {
      setAdults(adults.filter((_, i) => i !== index))
    }
  }

  const updateAdult = (index: number, field: keyof CreateAdultData, value: string) => {
    const newAdults = [...adults]
    newAdults[index] = { ...newAdults[index], [field]: value }
    setAdults(newAdults)
  }

  const addChild = () => {
    setChildren([...children, { name: '', age: 0 }])
  }

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index))
  }

  const updateChild = (index: number, field: keyof CreateChildData, value: string | number) => {
    const newChildren = [...children]
    newChildren[index] = { ...newChildren[index], [field]: value }
    setChildren(newChildren)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setGeneralError('')
    setIsLoading(true)

    try {
      // Validate form data
      const formData: CreateFamilyFormData = {
        name: familyName,
        adults: adults.map(adult => ({
          name: adult.name,
          email: adult.email,
          password: adult.password,
          profilePhotoUrl: adult.profilePhotoUrl || undefined,
        })),
        children: children.length > 0 ? children : undefined,
      }

      const validatedData = createFamilySchema.parse(formData)

      // Hash passwords for adults
      const adultsWithHashedPasswords = await Promise.all(
        validatedData.adults.map(async (adult) => {
          const passwordHash = adult.password 
            ? await bcrypt.hash(adult.password, 10)
            : undefined
          
          return {
            name: adult.name,
            email: adult.email,
            passwordHash,
            profilePhotoUrl: adult.profilePhotoUrl,
          }
        })
      )

      // Create family
      const family = await createFamily({
        name: validatedData.name,
        adults: adultsWithHashedPasswords,
        children: validatedData.children,
      })

      // Redirect to success page or login
      router.push('/auth/login?registered=true')
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const zodErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          const path = err.path.join('.')
          zodErrors[path] = err.message
        })
        setErrors(zodErrors)
      } else {
        // API or other errors
        setGeneralError(error.message || 'אירעה שגיאה בעת רישום המשפחה')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6" />
            רישום משפחה חדשה
          </CardTitle>
          <CardDescription>
            אנא מלא את הפרטים הבאים כדי להירשם כמשפחה. יש צורך במבוגר אחד לפחות.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {generalError && (
              <Alert variant="destructive">
                {generalError}
              </Alert>
            )}

            {/* Family Name */}
            <div className="space-y-2">
              <Label htmlFor="familyName">שם המשפחה (אופציונלי)</Label>
              <Input
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="לדוגמה: משפחת כהן"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Adults Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  מבוגרים
                </h3>
                <Button type="button" onClick={addAdult} variant="outline" size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף מבוגר
                </Button>
              </div>

              {adults.map((adult, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium">מבוגר {index + 1}</h4>
                    {adults.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeAdult(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`adult-name-${index}`}>שם מלא *</Label>
                      <Input
                        id={`adult-name-${index}`}
                        value={adult.name}
                        onChange={(e) => updateAdult(index, 'name', e.target.value)}
                        placeholder="שם מלא"
                        required
                      />
                      {errors[`adults.${index}.name`] && (
                        <p className="text-sm text-red-500">{errors[`adults.${index}.name`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`adult-email-${index}`}>דוא״ל *</Label>
                      <Input
                        id={`adult-email-${index}`}
                        type="email"
                        value={adult.email}
                        onChange={(e) => updateAdult(index, 'email', e.target.value)}
                        placeholder="example@email.com"
                        required
                      />
                      {errors[`adults.${index}.email`] && (
                        <p className="text-sm text-red-500">{errors[`adults.${index}.email`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`adult-password-${index}`}>סיסמה *</Label>
                      <Input
                        id={`adult-password-${index}`}
                        type="password"
                        value={adult.password || ''}
                        onChange={(e) => updateAdult(index, 'password', e.target.value)}
                        placeholder="לפחות 8 תווים"
                        required
                      />
                      {errors[`adults.${index}.password`] && (
                        <p className="text-sm text-red-500">{errors[`adults.${index}.password`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`adult-photo-${index}`}>קישור לתמונה (אופציונלי)</Label>
                      <Input
                        id={`adult-photo-${index}`}
                        type="url"
                        value={adult.profilePhotoUrl || ''}
                        onChange={(e) => updateAdult(index, 'profilePhotoUrl', e.target.value)}
                        placeholder="https://..."
                      />
                      {errors[`adults.${index}.profilePhotoUrl`] && (
                        <p className="text-sm text-red-500">{errors[`adults.${index}.profilePhotoUrl`]}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Children Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Baby className="h-5 w-5" />
                  ילדים (אופציונלי)
                </h3>
                <Button type="button" onClick={addChild} variant="outline" size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף ילד
                </Button>
              </div>

              {children.map((child, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium">ילד {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeChild(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`child-name-${index}`}>שם *</Label>
                      <Input
                        id={`child-name-${index}`}
                        value={child.name}
                        onChange={(e) => updateChild(index, 'name', e.target.value)}
                        placeholder="שם הילד"
                        required
                      />
                      {errors[`children.${index}.name`] && (
                        <p className="text-sm text-red-500">{errors[`children.${index}.name`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`child-age-${index}`}>גיל *</Label>
                      <Input
                        id={`child-age-${index}`}
                        type="number"
                        min="0"
                        max="18"
                        value={child.age || ''}
                        onChange={(e) => updateChild(index, 'age', parseInt(e.target.value) || 0)}
                        placeholder="0-18"
                        required
                      />
                      {errors[`children.${index}.age`] && (
                        <p className="text-sm text-red-500">{errors[`children.${index}.age`]}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {children.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  לא נוספו ילדים. לחץ על &quot;הוסף ילד&quot; כדי להוסיף.
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
              disabled={isLoading}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'שולח...' : 'שלח בקשה'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
