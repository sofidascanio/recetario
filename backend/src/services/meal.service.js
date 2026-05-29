import prisma from '../config/prisma.js'

export async function getMeals() {
    return prisma.meal.findMany({ orderBy: { name: 'asc' } })
}

export async function createMeal(name, category) {
    return prisma.meal.upsert({
        where: { name },
        update: {},
        create: { name, category },
    })
}