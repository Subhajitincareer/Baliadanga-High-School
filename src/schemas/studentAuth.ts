
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }).trim(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters" }).trim(),
  email: z.string().email({ message: "Please enter a valid email address" }).trim(),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .refine((value) => /[A-Z]/.test(value), { message: "Password must contain at least one uppercase letter" })
    .refine((value) => /[0-9]/.test(value), { message: "Password must contain at least one number" }),
  rollNumber: z.string().min(1, { message: "Roll number is required" }).trim(),
  className: z.string().min(1, { message: "Class is required" }).trim(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
