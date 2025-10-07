'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { updateFamily } from '@/lib/api';
import {
  updateFamilySchema,
  type UpdateFamilyFormData,
} from '@/lib/validation';
import type { Family } from '@/types/family';
import { Save, X } from 'lucide-react';
import { ZodError } from 'zod';

interface FamilyProfileEditProps {
  family: Family;
  onSuccess?: (updatedFamily: Family) => void;
  onCancel?: () => void;
}

export default function FamilyProfileEdit({
  family,
  onSuccess,
  onCancel,
}: FamilyProfileEditProps) {
  const [familyName, setFamilyName] = useState(family.name || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setIsLoading(true);

    try {
      // Validate form data
      const formData: UpdateFamilyFormData = {
        name: familyName,
      };

      const validatedData = updateFamilySchema.parse(formData);

      // Update family
      const updatedFamily = await updateFamily(family.id, validatedData);

      if (onSuccess) {
        onSuccess(updatedFamily);
      }
    } catch (error: any) {
      if (error instanceof ZodError) {
        // Zod validation errors
        const zodErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          zodErrors[path] = err.message;
        });
        setErrors(zodErrors);
      } else {
        // API or other errors
        setGeneralError(error.message || 'אירעה שגיאה בעת עדכון המשפחה');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>עריכת פרטי משפחה</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {generalError && <Alert variant="destructive">{generalError}</Alert>}

          <div className="space-y-2">
            <Label htmlFor="familyName">שם המשפחה</Label>
            <Input
              id="familyName"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="שם המשפחה"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 ml-2" />
            ביטול
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 ml-2" />
            {isLoading ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
