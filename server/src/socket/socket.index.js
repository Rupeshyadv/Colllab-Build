import { ClientToServerEvents, ServerToClientEvents } from "../constants.js"

export const initializeSocketIO = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id)

        socket.emit('message', () => {
            console.log('hello form shots')
        })
    })
}