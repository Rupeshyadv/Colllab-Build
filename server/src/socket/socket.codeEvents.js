import { ClientToServerEvents, ServerToClientEvents } from './socket.events.js'
import { clientRedis } from '../services/RedisService/clientRedis.js'
import { prisma } from '../db/prisma.client.js'
import { isSocketInRoom } from './socket.utils.js'

const roomUsers = {} // roomId -> set([userIds])
const usersCursors = {} // roomId -> userId -> cursor

const emitSocketError = (socket, message) => {
  socket.emit(ServerToClientEvents.SOCKET_ERROR, { message })
}

const removeUserFromRoom = (socket, roomId = socket.roomId) => {
  if (!roomId || !roomUsers[roomId] || !socket.user?.id) return

  roomUsers[roomId].delete(socket.user.id)
  if (usersCursors[roomId]) delete usersCursors[roomId][socket.user.id]

  if (roomUsers[roomId].size === 0) {
    delete roomUsers[roomId]
    delete usersCursors[roomId]
  }
}

export const registerCodeEvents = (socket, io) => {
  socket.on(ClientToServerEvents.JOIN_ROOM, async ({ roomId } = {}) => {
    if (typeof roomId !== 'string' || !roomId.trim()) {
      emitSocketError(socket, 'A valid room ID is required')
      return
    }

    try {
      const participant = socket.isLoadTest
        ? { session: { isActive: true } }
        : await prisma.participant.findUnique({
          where: {
            user_id_session_id: {
              user_id: socket.user.id,
              session_id: roomId,
            },
          },
          select: {
            session: { select: { isActive: true } },
          },
        })

      if (!participant || !participant.session.isActive) {
        emitSocketError(socket, 'You are not allowed to join this room')
        return
      }

      if (socket.roomId && socket.roomId !== roomId) removeUserFromRoom(socket)

      socket.join(roomId)
      socket.userId = socket.user.id
      socket.roomId = roomId

      if (!roomUsers[roomId]) roomUsers[roomId] = new Set()
      if (!usersCursors[roomId]) usersCursors[roomId] = {}

      const isUserAlreadyInRoom = roomUsers[roomId].has(socket.user.id)
      if (!isUserAlreadyInRoom) {
        roomUsers[roomId].add(socket.user.id)
        socket.to(roomId).emit(ServerToClientEvents.USER_JOINED, {
          userId: socket.user.id,
          roomUsers: [...roomUsers[roomId]],
        })
      }
    } catch (error) {
      console.error('Socket room authorization failed:', error)
      emitSocketError(socket, 'Unable to authorize this room')
    }
  })

  socket.on(ClientToServerEvents.CODE_CHANGE, async ({ roomId, code } = {}) => {
    if (!isSocketInRoom(socket, roomId)) {
      emitSocketError(socket, 'Join the room before sending code changes')
      return
    }

    socket.to(roomId).emit(ServerToClientEvents.CODE_UPDATE, {
      code,
      userId: socket.user.id,
      ...(typeof editId === 'string' ? { editId } : {}),
      ...(typeof sentAt === 'number' ? { sentAt } : {}),
    })

    try {
      await clientRedis.set(`room:${roomId}:code`, code)
      await clientRedis.set(`room:${roomId}:dirty`, 1)
    } catch (error) {
      console.error('Failed to cache code change:', error)
      emitSocketError(socket, 'Failed to save code change')
    }
  })

  socket.on(ClientToServerEvents.LOAD_TEST_CODE_CHANGE, async ({ roomId, code, editId, sentAt } = {}) => {
    if (!isSocketInRoom(socket, roomId)) {
      emitSocketError(socket, 'Join the room before sending code changes')
      return
    }

    socket.to(roomId).emit(ServerToClientEvents.LOAD_TEST_CODE_UPDATE, {
      code,
      userId: socket.user.id,
      editId,
      sentAt,
    })

    try {
      await clientRedis.set(`room:${roomId}:code`, code)
      await clientRedis.set(`room:${roomId}:dirty`, 1)
    } catch (error) {
      console.error('Failed to cache load-test code change:', error)
      emitSocketError(socket, 'Failed to save code change')
    }
  })

  socket.on(ClientToServerEvents.LEAVE_ROOM, ({ roomId } = {}) => {
    if (!isSocketInRoom(socket, roomId)) return

    removeUserFromRoom(socket, roomId)
    socket.leave(roomId)
    socket.to(roomId).emit(ServerToClientEvents.USER_LEFT, { userId: socket.user.id })
    socket.roomId = undefined
  })

  socket.on(ClientToServerEvents.CURSOR_MOVE, ({ roomId, cursor } = {}) => {
    if (!isSocketInRoom(socket, roomId)) {
      emitSocketError(socket, 'Join the room before sending cursor updates')
      return
    }

    usersCursors[roomId][socket.user.id] = cursor
    socket.to(roomId).emit(ServerToClientEvents.CURSOR_UPDATE, {
      cursor,
      userId: socket.user.id,
      color: 'blue',
    })
  })

  socket.on('disconnect', () => {
    if (!socket.roomId) return

    const roomId = socket.roomId
    removeUserFromRoom(socket, roomId)
    socket.to(roomId).emit(ServerToClientEvents.USER_LEFT, { userId: socket.user.id })
  })
}
