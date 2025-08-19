import { clientRedis } from './clientRedis.js';
import { patchCode } from '../../controllers/session.controller.js';

export async function startCodeFlush() {
    setInterval(async () => {
        try {
            const dirtyRooms = await clientRedis.keys('room:*:dirty')

            for (const roomKey of dirtyRooms) {
                const roomId = roomKey.split(':')[1]
                const code = await clientRedis.get(`room:${roomId}:code`)

                if (code) {
                    await patchCode(roomId, code)
                    await clientRedis.del(roomKey) // Remove dirty flag after flushing
                }
            }
        } catch (error) {
            console.error('Error during code flush:', error);
        }
    }, 2500)
}