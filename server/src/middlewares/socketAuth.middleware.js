import jwt from 'jsonwebtoken'
import { prisma } from '../db/prisma.client.js'

const getCookie = (cookieHeader, name) => {
  if (!cookieHeader) return null

  const pair = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))

  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null
}

const getSocketToken = (socket) => {
  const authToken = socket.handshake.auth?.token
  if (typeof authToken === 'string' && authToken.trim()) return authToken.trim()

  return getCookie(socket.handshake.headers.cookie, 'accessToken')
}

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const loadTestUserId = socket.handshake.auth?.loadTestUserId
    if (
      process.env.LOAD_TEST_BYPASS_AUTH === 'true'
      && socket.handshake.auth?.loadTest === true
      && typeof loadTestUserId === 'string'
      && loadTestUserId.trim()
    ) {
      socket.user = {
        id: loadTestUserId,
        name: loadTestUserId,
        username: loadTestUserId,
        email: `${loadTestUserId}@load-test.invalid`,
      }
      socket.isLoadTest = true
      return next()
    }

    const token = getSocketToken(socket)
    if (!token) return next(new Error('Authentication required'))

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
      },
    })

    if (!user) return next(new Error('Authenticated user not found'))

    socket.user = user
    next()
  } catch (error) {
    console.error('Socket authentication failed:', error.message)
    next(new Error('Invalid or expired authentication'))
  }
}
