import { ClientToServerEvents, ServerToClientEvents } from "./socket.events.js";
export const registerCodeEvents = (socket, io) => {
  // join a room
  socket.on(ClientToServerEvents.JOIN_ROOM, ({ roomId }) => {
    socket.join(roomId)
    socket.to(roomId).emit(ServerToClientEvents.USER_JOINED, { userId: socket.id })
  })

  // code change event
  socket.on(ClientToServerEvents.CODE_CHANGE, ({ roomId, code }) => {
    socket.to(roomId).emit(ServerToClientEvents.CODE_UPDATE, 
      { 
        code, 
        userId: socket.id,
      }
    )
  })

  // leave a room
  socket.on(ClientToServerEvents.LEAVE_ROOM, ({ roomId }) => {
    socket.leave(roomId)
    socket.to(roomId).emit(ServerToClientEvents.USER_LEFT, { userId: socket.id })
  })
}   