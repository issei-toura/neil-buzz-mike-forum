import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password must be at most 16 characters')
      .regex(/\d/, 'Include at least one number')
      .regex(/[^A-Za-z0-9\s]/, 'Include at least one symbol')
      .regex(/[a-z]/, 'Include a lowercase letter')
      .regex(/[A-Z]/, 'Include an uppercase letter'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    telephone: z.string().min(1, 'Phone is required'),
    street: z.string().min(1, 'Street is required'),
    number: z.string().min(1, 'Number is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    acceptedTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.acceptedTerms === true, {
    message: 'You must agree to the terms and conditions',
    path: ['acceptedTerms'],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

/** Same strength rules as signup `password` — used for settings "update password". */
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password must be at most 16 characters')
      .regex(/\d/, 'Include at least one number')
      .regex(/[^A-Za-z0-9\s]/, 'Include at least one symbol')
      .regex(/[a-z]/, 'Include a lowercase letter')
      .regex(/[A-Z]/, 'Include an uppercase letter'),
    confirmNewPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from your current password',
    path: ['newPassword'],
  });

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

/** Field names per signup wizard step (0-based) for RHF `trigger`. Step 3 is profile-only (no fields here). */
export const signUpStepFields: (keyof SignUpFormValues)[][] = [
  ['firstName', 'lastName', 'email'],
  ['street', 'number', 'city', 'state', 'postalCode', 'country', 'telephone'],
  ['password', 'confirmPassword', 'acceptedTerms'],
];

export const SIGNUP_TOTAL_STEPS = 4;
