export async function seedUsers(prisma) {
    const admin = await prisma.user.upsert({
        where: { email: 'admin@recetario.com' },
        update: {},
        create: {
        email: 'admin@recetario.com',
        username: 'admin',
        displayName: 'Administrador',
        passwordHash: 'placeholder_hash',
        bio: 'Cuenta administradora del sistema.',
        isVerified: true,
        },
    })

    const chef = await prisma.user.upsert({
        where: { email: 'chef.maria@recetario.com' },
        update: {},
        create: {
        email: 'chef.maria@recetario.com',
        username: 'chef_maria',
        displayName: 'María González',
        passwordHash: 'placeholder_hash',
        bio: 'Cocinera apasionada. Especialista en cocina mediterránea y pastelería.',
        isVerified: true,
        },
    })

    const home = await prisma.user.upsert({
        where: { email: 'juan.perez@recetario.com' },
        update: {},
        create: {
        email: 'juan.perez@recetario.com',
        username: 'juanperez',
        displayName: 'Juan Pérez',
        passwordHash: 'placeholder_hash',
        bio: 'Cocinero amateur. Me gustan los asados y las empanadas.',
        },
    })

    return { admin, chef, home }
}