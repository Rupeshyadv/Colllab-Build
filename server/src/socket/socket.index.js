import { registerCodeEvents } from './socket.codeEvents.js'
import { registerTerminalEvents } from './socket.terminalEvents.js'
export const initializeSocketIO = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id)

        registerCodeEvents(socket, io)
        registerTerminalEvents(socket, io)
    })
}
