import { z } from 'zod'

export const updateProfileSchema = z.object({
    displayName: z.string().min(2).max(50).trim().optional(),
    bio: z.string().max(300).trim().optional(),
    avatarUrl: z.string().url().optional(),
})