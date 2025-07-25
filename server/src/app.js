import express from 'express';
import cookieParser from "cookie-parser"
import cors from "cors"
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeSocketIO } from './socket/socket.index.js';
 
export const app = express()
export const httpServer = createServer(app)
export const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    },
    pingTimeout: 40000,
    pingInterval: 10000,
    transports: ['websocket', 'polling'],
})

console.log("print io", io)

app.use(express.json({}))
app.use(cookieParser())
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true, 
    }
))

app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.send("Welcome to the server")   
})

// Import routes
import { userRouter } from './routes/user.routes.js';
import { sessionRouter } from './routes/session.routes.js';
 
app.use("/api/v1/users", userRouter)
app.use("/api/v1/sessions", sessionRouter)

initializeSocketIO(io)