import { ClientToServerEvents, ServerToClientEvents } from "./socket.events.js";
import { clientRedis } from "../services/RedisService/clientRedis.js";
const roomUsers = {}  // roomId -> set([userIds])
const usersCursors = {}  // userId -> { roomId -> userId: cursor }

export const registerCodeEvents = (socket, io) => {

  // join a room
  socket.on(ClientToServerEvents.JOIN_ROOM, ({ roomId, userId }) => {
    socket.join(roomId);
    socket.userId = userId;
    socket.roomId = roomId;

    if (!roomUsers[roomId]) roomUsers[roomId] = new Set();
    if (!usersCursors[roomId]) usersCursors[roomId] = {};
    
    const isUserAlreadyInRoom = roomUsers[roomId].has(userId);
    if (!isUserAlreadyInRoom){
      roomUsers[roomId].add(userId);
      socket.to(roomId).emit(ServerToClientEvents.USER_JOINED, { userId, roomUsers: [...roomUsers[roomId]] });
    }
  })

  // code change event, also save in redis 
  socket.on(ClientToServerEvents.CODE_CHANGE, async ({ roomId, code, userId }) => {
    socket.to(roomId).emit(ServerToClientEvents.CODE_UPDATE, 
      { 
        code, 
        userId,
      }
    )

    // cache the code in Redis
    await clientRedis.set(`room:${roomId}:code`, code)
    await clientRedis.set(`room:${roomId}:dirty`, 1)
  })

  // leave a room
  socket.on(ClientToServerEvents.LEAVE_ROOM, ({ roomId, userId }) => {
    if (roomUsers[roomId]) {
      roomUsers[roomId].delete(userId);
      if (usersCursors[roomId]) delete usersCursors[roomId][userId];

      // If room is empty, clean memory
      if (roomUsers[roomId].size === 0) {
        delete roomUsers[roomId];
        delete usersCursors[roomId];
      }
    }

    socket.leave(roomId)
    socket.to(roomId).emit(ServerToClientEvents.USER_LEFT, { userId })
  })

  // cursor movements
  socket.on(ClientToServerEvents.CURSOR_MOVE, ({ roomId, cursor, userId }) => {
    if(!usersCursors[userId]) usersCursors[userId] = {}
    usersCursors[roomId][userId] = cursor

    socket.to(roomId).emit(ServerToClientEvents.CURSOR_UPDATE, { cursor, userId, color: "blue" })
  })

}   