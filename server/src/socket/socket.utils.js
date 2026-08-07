export const isSocketInRoom = (socket, roomId) => (
  typeof roomId === 'string' && socket.roomId === roomId && socket.rooms.has(roomId)
)
