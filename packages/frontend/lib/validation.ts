import { z } from 'zod';

// Hebrew error messages
export const hebrewMessages = {
  required: 'שדה חובה',
  invalidEmail: 'כתובת דוא״ל לא תקינה',
  passwordTooShort: 'הסיסמה חייבת להכיל לפחות 8 תווים',
  passwordRequirements:
    'הסיסמה חייבת להכיל אותיות גדולות, אותיות קטנות ומספרים',
  passwordsDoNotMatch: 'הסיסמאות אינן תואמות',
  invalidPhone: 'מספר טלפון לא תקין',
  nameTooShort: 'השם חייב להכיל לפחות 2 תווים',
  ageTooYoung: 'הגיל חייב להיות לפחות 0',
  ageTooOld: 'הגיל חייב להיות עד 120',
  invalidAge: 'גיל לא תקין',
};

// Email validation
export const emailSchema = z
  .string()
  .min(1, hebrewMessages.required)
  .email(hebrewMessages.invalidEmail);

// Password validation
export const passwordSchema = z
  .string()
  .min(8, hebrewMessages.passwordTooShort)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    hebrewMessages.passwordRequirements,
  );

// Phone validation (Israeli format)
export const phoneSchema = z
  .string()
  .regex(/^(05[0-9]\d{7}|0[2-4]\d{8}|0[89]\d{8})$/, hebrewMessages.invalidPhone)
  .optional()
  .or(z.literal(''));

// Name validation
export const nameSchema = z
  .string()
  .min(2, hebrewMessages.nameTooShort)
  .min(1, hebrewMessages.required);

// Age validation
export const ageSchema = z
  .number({ message: hebrewMessages.invalidAge })
  .int()
  .min(0, hebrewMessages.ageTooYoung)
  .max(120, hebrewMessages.ageTooOld);

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, hebrewMessages.required),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Registration form validation
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, hebrewMessages.required),
    phone: phoneSchema,
    familyName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: hebrewMessages.passwordsDoNotMatch,
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Child form validation
export const childSchema = z.object({
  name: nameSchema,
  age: ageSchema,
});

export type ChildFormData = z.infer<typeof childSchema>;

// Family validation schemas
export const adultSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema.optional(),
  profilePhotoUrl: z
    .string()
    .url('קישור תמונה לא תקין')
    .optional()
    .or(z.literal('')),
});

export type AdultFormData = z.infer<typeof adultSchema>;

export const createFamilySchema = z.object({
  name: z
    .string()
    .min(2, 'שם המשפחה חייב להכיל לפחות 2 תווים')
    .optional()
    .or(z.literal('')),
  adults: z.array(adultSchema).min(1, 'נדרש לפחות מבוגר אחד'),
  children: z.array(childSchema).optional(),
});

export type CreateFamilyFormData = z.infer<typeof createFamilySchema>;

export const updateFamilySchema = z.object({
  name: z
    .string()
    .min(2, 'שם המשפחה חייב להכיל לפחות 2 תווים')
    .optional()
    .or(z.literal('')),
});

export type UpdateFamilyFormData = z.infer<typeof updateFamilySchema>;

export const addMemberSchema = z
  .object({
    type: z.enum(['ADULT', 'CHILD'], { message: 'יש לבחור סוג חבר' }),
    name: nameSchema,
    age: z.number().int().min(0).max(18).optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    profilePhotoUrl: z
      .string()
      .url('קישור תמונה לא תקין')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.type === 'ADULT') {
        return !!data.email;
      }
      return true;
    },
    {
      message: 'מבוגר חייב לכלול כתובת דוא״ל',
      path: ['email'],
    },
  )
  .refine(
    (data) => {
      if (data.type === 'CHILD') {
        return data.age !== undefined && data.age >= 0 && data.age <= 18;
      }
      return true;
    },
    {
      message: 'ילד חייב לכלול גיל בין 0 ל-18',
      path: ['age'],
    },
  );

export type AddMemberFormData = z.infer<typeof addMemberSchema>;

export const updateMemberSchema = z.object({
  name: nameSchema.optional(),
  age: z.number().int().min(0).max(18).optional(),
  email: emailSchema.optional(),
  profilePhotoUrl: z
    .string()
    .url('קישור תמונה לא תקין')
    .optional()
    .or(z.literal('')),
});

export type UpdateMemberFormData = z.infer<typeof updateMemberSchema>;

// Helper functions for form validation
export function validateEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validatePassword(password: string): boolean {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
}

export function validatePhone(phone: string): boolean {
  try {
    phoneSchema.parse(phone);
    return true;
  } catch {
    return false;
  }
}

// Format error messages for display
export function formatZodError(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return errors;
}
