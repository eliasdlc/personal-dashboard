'use server';

import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Schemas for validation
const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const RegisterSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().optional(),
});

export type AuthState = {
    errors?: {
        email?: string[];
        password?: string[];
    };
    message?: string | null;
};

export async function authenticate(
    prevState: AuthState | undefined,
    formData: FormData,
) {
    const validatedFields = LoginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid credentials.',
        };
    }

    const { email, password } = validatedFields.data;

    try {
        await signIn('credentials', { email, password, redirectTo: '/' });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { message: 'Invalid credentials.' };
                default:
                    return { message: 'Something went wrong.' };
            }
        }
        throw error;
    }
}

export async function createUser(
    prevState: AuthState | undefined,
    formData: FormData,
) {
    const validatedFields = RegisterSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Register.',
        };
    }

    const { email, password, name } = validatedFields.data;

    try {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (existingUser) {
            return {
                message: 'Email already in use.',
                errors: { email: ['Email already in use.'] }
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.insert(users).values({
            email,
            password: hashedPassword,
            name: name || undefined,
        });

    } catch (error) {
        return {
            message: 'Database Error: Failed to Create User.',
        };
    }

    // Login after registration
    try {
        await signIn('credentials', { email, password, redirectTo: '/' });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { message: 'Registration successful but failed to login.' };
                default:
                    return { message: 'Something went wrong.' };
            }
        }
        throw error;
    }
}
