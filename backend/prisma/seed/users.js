export async function createUsers(prisma) {
    console.log('Creando usuarios...')

    const usersData = [
        {
            email: 'ana.cocinera@example.com',
            username: 'anacocina',
            displayName: 'Ana García',
            bio: 'Amante de la cocina casera y saludable 🥑',
            isVerified: true,
            avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ana',
        },
        {
            email: 'chef.juan@example.com',
            username: 'chefjuan',
            displayName: 'Juan Pérez',
            bio: 'Chef profesional especializado en cocina mediterránea',
            isVerified: true,
            avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Juan',
        },
        {
            email: 'maria.sweets@example.com',
            username: 'mariadulce',
            displayName: 'María López',
            bio: 'Repostería creativa sin gluten',
            isVerified: false,
            avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maria',
        },
        {
            email: 'carlos.veggie@example.com',
            username: 'carlosverde',
            displayName: 'Carlos Verde',
            bio: 'Cocina vegetariana y vegana 🌱',
            isVerified: true,
            avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Carlos',
        },
    ]

    const users = []
    for (const data of usersData) {
        const user = await prisma.user.upsert({
            where: { email: data.email },
            update: {},
            create: {
                ...data,
                passwordHash: null,
            },
        })
        users.push(user)
    }
    return users
}