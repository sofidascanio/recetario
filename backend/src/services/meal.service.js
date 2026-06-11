import prisma from '../config/prisma.js'

export async function getMeals({ category } = {}) {
    return prisma.meal.findMany({
        where: category ? { category } : undefined,
        orderBy: { name: 'asc' },
    })
}

export async function createMeal(name, category) {
    return prisma.meal.upsert({
        where: { name },
        update: {},
        create: { name, category },
    })
}