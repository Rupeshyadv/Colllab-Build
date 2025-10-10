import { createClient } from 'redis'

const clientRedis = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: false,
        connectTimeout: 7000,
    }
})

clientRedis.on('error', (err) => console.error('Redis Client Error', err))

await clientRedis.connect()

export { clientRedis }