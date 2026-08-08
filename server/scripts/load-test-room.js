#!/usr/bin/env node

import 'dotenv/config'
import { io } from 'socket.io-client'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'

const CLIENT_EVENTS = {
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  CODE_CHANGE: 'code_change',
  LOAD_TEST_CODE_CHANGE: 'load_test_code_change',
  CURSOR_MOVE: 'cursor_move',
}

const SERVER_EVENTS = {
  LOAD_TEST_CODE_UPDATE: 'load_test_code_update',
  CURSOR_UPDATE: 'cursor_update',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  SOCKET_ERROR: 'socket_error',
}

const DEFAULTS = {
  url: process.env.LOAD_TEST_URL || `http://localhost:${process.env.PORT || 3000}`,
  room: process.env.LOAD_TEST_ROOM || '',
  tokensFile: process.env.LOAD_TEST_TOKENS_FILE || '',
  start: 10,
  step: 10,
  max: 200,
  rampMs: 250,
  holdSeconds: 30,
  editSeconds: 2,
  failureRate: 0.2,
  timeoutMs: 10_000,
}

function usage() {
  console.log(`
Usage:
  node scripts/load-test-room.js --room ROOM_ID [options]

Options:
  --url URL              Socket.IO server (default: ${DEFAULTS.url})
  --tokens-file PATH     File containing one access token per line
  --start N              First concurrent-user stage (default: ${DEFAULTS.start})
  --step N               Users added per stage (default: ${DEFAULTS.step})
  --max N                Hard maximum; never exceeded (default: ${DEFAULTS.max})
  --hold N               Seconds to measure each stage (default: ${DEFAULTS.holdSeconds})
  --ramp-ms N            Delay between socket connections (default: ${DEFAULTS.rampMs})
  --edit-seconds N       Seconds between each user's code edits (default: ${DEFAULTS.editSeconds})
  --failure-rate N       Stop when failed connections exceed this fraction (default: ${DEFAULTS.failureRate})
  --timeout-ms N         Connection timeout (default: ${DEFAULTS.timeoutMs})
  --help                 Show this help

Examples:
  node scripts/load-test-room.js --room YOUR_SESSION_ID
  node scripts/load-test-room.js --room YOUR_SESSION_ID --start 25 --step 25 --max 500 --hold 60
`)
}

function parseArgs(argv) {
  const options = { ...DEFAULTS }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--help') {
      usage()
      process.exit(0)
    }
    if (!arg.startsWith('--')) throw new Error(`Unexpected argument: ${arg}`)
    const key = arg.slice(2).replaceAll('-', '')
    const value = argv[i + 1]
    if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for ${arg}`)
    i += 1
    if (key === 'url' || key === 'room' || key === 'tokensfile') {
      options[key === 'tokensfile' ? 'tokensFile' : key] = value
    }
    else if (['start', 'step', 'max', 'rampms', 'hold', 'editseconds', 'timeoutms'].includes(key)) {
      const optionKey = key === 'rampms' ? 'rampMs' : key === 'hold' ? 'holdSeconds' : key === 'editseconds' ? 'editSeconds' : key
      options[optionKey] = Number(value)
    } else if (key === 'failurerate') options.failureRate = Number(value)
    else throw new Error(`Unknown option: ${arg}`)
  }

  if (!options.room) throw new Error('--room is required')
  if (!Number.isInteger(options.start) || options.start < 1) throw new Error('--start must be a positive integer')
  if (!Number.isInteger(options.step) || options.step < 1) throw new Error('--step must be a positive integer')
  if (!Number.isInteger(options.max) || options.max < options.start) throw new Error('--max must be >= --start')
  if (options.holdSeconds <= 0 || options.rampMs < 0 || options.editSeconds <= 0 || options.timeoutMs <= 0) {
    throw new Error('Timing options must be positive (ramp-ms may be zero)')
  }
  if (options.failureRate < 0 || options.failureRate > 1) throw new Error('--failure-rate must be between 0 and 1')
  return options
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function makeUser(url, roomId, userNumber, token, options, stats) {
  const userId = `load-test-${userNumber}-${randomUUID()}`
  const socket = io(url, {
    transports: ['websocket'],
    reconnection: false,
    timeout: options.timeoutMs,
    forceNew: true,
    auth: token
      ? { token }
      : { loadTest: true, loadTestUserId: userId },
  })
  const user = { socket, userId, joined: false, editTimer: null }

  stats.created += 1
  const connectedAt = Date.now()

  socket.once('connect', () => {
    stats.connected += 1
    stats.connectionLatencies.push(Date.now() - connectedAt)
    socket.emit(CLIENT_EVENTS.JOIN_ROOM, { roomId, userId })
    user.joined = true
    user.editTimer = setInterval(() => {
      if (!socket.connected) return
      stats.codeChangesSent += 1
      const editId = `${userId}-edit-${stats.codeChangesSent}`
      const sentAt = performance.now()
      socket.emit(CLIENT_EVENTS.LOAD_TEST_CODE_CHANGE, {
        roomId,
        userId,
        editId,
        sentAt,
        code: `// load-test user ${userNumber}\nconst value${userNumber} = ${stats.codeChangesSent};\n`,
      })
      stats.cursorMovesSent += 1
      socket.emit(CLIENT_EVENTS.CURSOR_MOVE, {
        roomId,
        userId,
        cursor: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1,
        },
      })
    }, options.editSeconds * 1000)
  })

  socket.on('connect_error', (error) => {
    stats.connectionErrors += 1
    stats.lastError = error.message
  })
  socket.on('disconnect', (reason) => {
    stats.disconnected += 1
    stats.disconnectReasons[reason] = (stats.disconnectReasons[reason] || 0) + 1
  })
  socket.on(SERVER_EVENTS.LOAD_TEST_CODE_UPDATE, ({ sentAt } = {}) => {
    stats.codeUpdatesReceived += 1
    if (typeof sentAt !== 'number') {
      stats.syncLatencyMissingTimestamps += 1
      return
    }

    const latencyMs = performance.now() - sentAt
    if (latencyMs >= 0 && Number.isFinite(latencyMs)) stats.syncLatencies.push(latencyMs)
    else stats.syncLatencyInvalidSamples += 1
  })
  socket.on(SERVER_EVENTS.CURSOR_UPDATE, () => { stats.cursorUpdatesReceived += 1 })
  socket.on(SERVER_EVENTS.USER_JOINED, () => { stats.userJoinedEventsReceived += 1 })
  socket.on(SERVER_EVENTS.USER_LEFT, () => { stats.userLeftEventsReceived += 1 })
  socket.on(SERVER_EVENTS.SOCKET_ERROR, ({ message } = {}) => {
    stats.socketErrors += 1
    stats.lastError = message || 'socket_error'
  })

  return user
}

function newStats() {
  return {
    created: 0, connected: 0, connectionErrors: 0, disconnected: 0,
    codeChangesSent: 0, cursorMovesSent: 0, codeUpdatesReceived: 0,
    cursorUpdatesReceived: 0, userJoinedEventsReceived: 0, userLeftEventsReceived: 0,
    socketErrors: 0, connectionLatencies: [], syncLatencies: [],
    syncLatencyMissingTimestamps: 0, syncLatencyInvalidSamples: 0,
    disconnectReasons: {}, lastError: '',
  }
}

function summarize(stats, target, activeUsers, elapsedMs) {
  const avg = stats.connectionLatencies.length
    ? Math.round(stats.connectionLatencies.reduce((a, b) => a + b, 0) / stats.connectionLatencies.length)
    : null
  const failedConnections = target - activeUsers
  const sortedSyncLatencies = [...stats.syncLatencies].sort((a, b) => a - b)
  const percentile = (ratio) => sortedSyncLatencies.length
    ? Number(sortedSyncLatencies[Math.min(
      sortedSyncLatencies.length - 1,
      Math.ceil(sortedSyncLatencies.length * ratio) - 1,
    )].toFixed(2))
    : null
  const syncAverage = sortedSyncLatencies.length
    ? Number((sortedSyncLatencies.reduce((sum, latency) => sum + latency, 0) / sortedSyncLatencies.length).toFixed(2))
    : null
  return {
    targetUsers: target,
    connectedUsers: activeUsers,
    failedConnections,
    disconnected: stats.disconnected,
    connectionFailureRate: target ? Number((failedConnections / target).toFixed(3)) : 1,
    socketErrors: stats.socketErrors,
    codeChangesSent: stats.codeChangesSent,
    cursorMovesSent: stats.cursorMovesSent,
    codeUpdatesReceived: stats.codeUpdatesReceived,
    cursorUpdatesReceived: stats.cursorUpdatesReceived,
    syncLatencySamples: sortedSyncLatencies.length,
    syncLatencyMissingTimestamps: stats.syncLatencyMissingTimestamps,
    syncLatencyInvalidSamples: stats.syncLatencyInvalidSamples,
    syncLatencyMs: {
      average: syncAverage,
      p50: percentile(0.5),
      p95: percentile(0.95),
      max: sortedSyncLatencies.length ? Number(sortedSyncLatencies.at(-1).toFixed(2)) : null,
    },
    averageConnectMs: avg,
    elapsedSeconds: Number((elapsedMs / 1000).toFixed(1)),
    lastError: stats.lastError || null,
    disconnectReasons: stats.disconnectReasons,
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const tokens = options.tokensFile
    ? readFileSync(options.tokensFile, 'utf8').split(/\r?\n/).map((token) => token.trim()).filter(Boolean)
    : []
  const users = []
  let interrupted = false

  const cleanup = () => {
    for (const user of users) {
      if (user.editTimer) clearInterval(user.editTimer)
      if (user.socket.connected && user.joined) user.socket.emit(CLIENT_EVENTS.LEAVE_ROOM, { roomId: options.room, userId: user.userId })
      user.socket.disconnect()
    }
  }
  process.once('SIGINT', () => { interrupted = true; cleanup() })
  process.once('SIGTERM', () => { interrupted = true; cleanup() })

  console.log(`Load test: ${options.url}, room=${options.room}`)
  console.log(`Authentication tokens loaded: ${tokens.length}`)
  console.log(`Safety limits: max=${options.max}, stage=${options.holdSeconds}s, stop failure-rate=${options.failureRate}`)

  let previousStage = 0
  for (let target = options.start; target <= options.max && !interrupted; target += options.step) {
    const stageStats = newStats()
    const stageStarted = Date.now()
    while (users.length < target && !interrupted) {
      const token = tokens.length ? tokens[(users.length) % tokens.length] : ''
      users.push(makeUser(options.url, options.room, users.length + 1, token, options, stageStats))
      await sleep(options.rampMs)
    }
    await sleep(options.holdSeconds * 1000)

    const activeUsers = users.filter((u) => u.socket.connected).length
    const result = summarize(stageStats, target, activeUsers, Date.now() - stageStarted)
    console.log(JSON.stringify({ stage: result, totalActiveSockets: activeUsers }))
    const failure = result.connectionFailureRate > options.failureRate || result.connectedUsers < target * (1 - options.failureRate)
    const abnormalDisconnects = result.disconnected > 0 && result.disconnected >= Math.max(1, Math.ceil(target * options.failureRate))
    if (failure || abnormalDisconnects) {
      console.error(`STOP: saturation/failure detected at the ${target}-user stage; inspect the stage JSON above.`)
      break
    }
    previousStage = target
  }

  cleanup()
  console.log(JSON.stringify({ completed: !interrupted, lastHealthyStage: previousStage }))
}

main().catch((error) => {
  console.error(`Load test failed to start: ${error.message}`)
  process.exitCode = 1
})
