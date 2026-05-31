// mapa de userId -> Set de Response objects 
// (un usuario puede tener multiples pestañas abiertas, cada una con su propia conexion sse)
const connections = new Map()

export const sse = {
    // registra nueva conexion
    addConnection(userId, res) {
        if (!connections.has(userId)) {
            connections.set(userId, new Set())
        }
        connections.get(userId).add(res)
        console.log(`SSE conectado: ${userId} (${connections.get(userId).size} conexiones)`)
    },

    // elimina conexion cuando el cliente se desconecta
    removeConnection(userId, res) {
        const userConnections = connections.get(userId)
        if (!userConnections) return

        userConnections.delete(res)

        if (userConnections.size === 0) {
            connections.delete(userId)
        }
        console.log(`SSE desconectado: ${userId}`)
    },

    // emite un evento a un usuario especifico
    emit(userId, eventName, data) {
        const userConnections = connections.get(userId)
        if (!userConnections || userConnections.size === 0) return

        const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`

        userConnections.forEach(res => {
            try {
                res.write(payload)
            } catch (err) {
                // la conexion se cerro de forma inesperada
                userConnections.delete(res)
            }
        })
    },

    // cuantos usuarios estan conectados
    getStats() {
        let totalConnections = 0
        connections.forEach(set => { totalConnections += set.size })
        return {
            connectedUsers: connections.size,
            totalConnections,
        }
    },
}