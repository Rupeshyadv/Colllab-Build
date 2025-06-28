import express from 'express';
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(express.json({}))
app.use(cookieParser())
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true, 
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    }
))

app.use(express.urlencoded({ extended: true }))

// Import routes
import { userRouter } from './routes/user.routes.js';

app.use("/api/v1/users", userRouter)






export {app}