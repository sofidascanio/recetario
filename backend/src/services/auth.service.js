import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.js'
import { JWT_CONFIG } from '../config/jwt.js'
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../middlewares/error.middleware.js'
import * as notificationService from './notification.service.js'

// Register
export async function register({ email, username, displayName, password }) {
    // verifica duplicados antes de hashear
    const existing = await prisma.user.findFirst({
        where: {
        OR: [{ email }, { username }],
        },
    })

    if (existing) {
        const field = existing.email === email ? 'email' : 'username'
        throw new ConflictError(`El ${field} ya está en uso`)
    }

    // hashea contraseña
    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
        data: { email, username, displayName, passwordHash },
        select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
        },
    })

    notificationService.notifySystem({
        userId:  user.id,
        message: `¡Bienvenido/a a Recetario, ${displayName}! Explora recetas y agrega ingredientes a tu heladera.`,
        link: '/recommendations',
    }).catch(console.error)

    const token = generateToken(user.id)
    return { user, token }
}

// Login
export async function login({ username, password }) {
    const user = await prisma.user.findUnique({
        where: { username },
    })

    if (!user || !user.passwordHash) {
        throw new UnauthorizedError('Usuario o contraseña incorrectos')
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
        throw new UnauthorizedError('Usuario o contraseña incorrectos')
    }

    const { passwordHash: _, ...userWithoutPassword } = user
    const token = generateToken(user.id)
    return { user: userWithoutPassword, token }
}

// Get current user
export async function getMe(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        _count: {
            select: {
            recipes: true,
            followers: true,
            following: true,
            },
        },
        },
    })

    if (!user) throw new NotFoundError('Usuario no encontrado')
    return user
}

// Helper privado
function generateToken(userId) {
    return jwt.sign({ sub: userId }, JWT_CONFIG.secret, {
        expiresIn: JWT_CONFIG.expiresIn,
    })
}