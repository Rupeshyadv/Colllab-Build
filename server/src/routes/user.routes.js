import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.route("/register").post(registerUser)
userRouter.route("/login").post(loginUser)

// Secure routes
userRouter.route("/logout").post(authMiddleware, logoutUser)
userRouter.route("/auth-check").get(authMiddleware, (req, res) => res.sendStatus(200))
userRouter.route("/profile/edit-avatar").post(authMiddleware, (req, res) => {})


export { userRouter }