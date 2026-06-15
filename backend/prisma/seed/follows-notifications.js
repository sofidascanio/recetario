import { NotificationType } from '@prisma/client'

export async function createFollowsAndNotifications(prisma, users, recipes) {
    console.log('Creando follows y notificaciones...')

    const followsData = [
        { follower: users[0], following: users[1] },
        { follower: users[2], following: users[0] },
        { follower: users[3], following: users[2] },
        { follower: users[3], following: users[0] },
    ]

    for (const f of followsData) {
        await prisma.follow.upsert({
            where: {
                followerId_followingId: {
                    followerId: f.follower.id,
                    followingId: f.following.id,
                },
            },
            update: {},
            create: {
                followerId: f.follower.id,
                followingId: f.following.id,
            },
        })
    }

    const firstComment = await prisma.comment.findFirst()
    const secondComment = await prisma.comment.findFirst({ skip: 1 })

    const notificationsData = [
        {
            type: NotificationType.FOLLOW,
            userId: users[1].id,
            actorId: users[0].id,
            data: { message: 'Ana García comenzó a seguirte' },
        },
        {
            type: NotificationType.COMMENT,
            userId: users[0].id,
            actorId: users[1].id,
            recipeId: recipes[0].id,
            commentId: firstComment?.id,
            data: { recipeTitle: recipes[0].title, preview: 'Me ha quedado espectacular...' },
        },
        {
            type: NotificationType.RATING,
            userId: users[2].id,
            actorId: users[0].id,
            recipeId: recipes[2].id,
            data: { recipeTitle: recipes[2].title, score: 4 },
        },
    ]

    for (const notif of notificationsData) {
        await prisma.notification.create({
            data: {
                type: notif.type,
                read: false,
                user: { connect: { id: notif.userId } },
                actor: notif.actorId ? { connect: { id: notif.actorId } } : undefined,
                recipe: notif.recipeId ? { connect: { id: notif.recipeId } } : undefined,
                commentId: notif.commentId,
                data: notif.data,
            },
        })
    }
}