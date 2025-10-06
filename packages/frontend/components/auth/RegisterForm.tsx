'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { registerSchema, type RegisterFormData } from '@/lib/validation'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { confirmPassword, ...registerData } = data
      await registerUser(registerData)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה ברישום')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="text-right">
          {error}
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-right block">
          שם מלא <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="שם פרטי ושם משפחה"
          {...register('name')}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive text-right">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-right block">
          דוא״ל <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          dir="ltr"
          placeholder="example@email.com"
          className="text-left"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive text-right">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-right block">
          טלפון <span className="text-muted-foreground text-sm">(אופציונלי)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          dir="ltr"
          placeholder="050-1234567"
          className="text-left"
          {...register('phone')}
          disabled={isLoading}
        />
        {errors.phone && (
          <p className="text-sm text-destructive text-right">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="familyName" className="text-right block">
          שם משפחה <span className="text-muted-foreground text-sm">(אופציונלי)</span>
        </Label>
        <Input
          id="familyName"
          type="text"
          placeholder="משפחת..."
          {...register('familyName')}
          disabled={isLoading}
        />
        {errors.familyName && (
          <p className="text-sm text-destructive text-right">{errors.familyName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-right block">
          סיסמה <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password')}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive text-right">{errors.password.message}</p>
        )}
        <p className="text-xs text-muted-foreground text-right">
          הסיסמה חייבת להכיל לפחות 8 תווים, אותיות גדולות, אותיות קטנות ומספרים
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-right block">
          אימות סיסמה <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('confirmPassword')}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive text-right">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              נרשם...
            </>
          ) : (
            'הירשם'
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        ההרשמה כפופה לאישור מנהל המערכת
      </p>
    </form>
  )
}
