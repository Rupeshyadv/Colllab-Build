import jwt from "jsonwebtoken"
import { ApiError } from '../utils/ApiError.js'
import { prisma } from '../db/prisma.client.js'

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "") || req.cookies?.accessToken
        if (!token) {
            throw new ApiError(401, "Access denied. No token provided.")
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if (!decoded) {
            throw new ApiError(401, "Invalid token.")
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        })

        if (!user) {
            throw new ApiError(404, "User not found.")
        }

        req.user = {
            id: user.id,
            username: user.username,
            name: user.name || null, 
            email: user.email,  
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        }

        next()

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message })
        }
        console.error("Authentication error:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}