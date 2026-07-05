import { z } from 'zod'

export const registerSchema = z.object({
    email: z
        .email('Email inválido')
        .toLowerCase(),

    username: z
        .string()
        .min(3, 'Mínimo 3 caracteres')
        .max(20, 'Máximo 20 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo')
        .toLowerCase(),

    displayName: z
        .string()
        .min(2, 'Mínimo 2 caracteres')
        .max(50, 'Máximo 50 caracteres')
        .trim(),

    password: z
        .string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número'),
})

export const loginSchema = z.object({
    username: z.string()
        .min(1, 'El usuario es requerido')
        .toLowerCase()
        .trim(),

    password: z
        .string()
        .min(1, 'La contraseña es requerida'),
})