import { PrismaClient } from '@prisma/client'
import { runSeed } from './seed/index.js'

const prisma = new PrismaClient()

runSeed(prisma)
    .catch(console.error)
    .finally(() => prisma.$disconnect())