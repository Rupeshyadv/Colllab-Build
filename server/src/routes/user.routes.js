import { Router } from "express";
import { loginUser, logoutUser, registerUser, eidtUserProfile, getGoogleAuthURL, googleOAuthCallback, refreshAccessToken } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.midlleware.js";

const userRouter = Router()

userRouter.route("/register").post(registerUser)
userRouter.route("/login").post(loginUser)

// OAuth with Google
userRouter.route("/auth/google/url").get(getGoogleAuthURL)
userRouter.route("/auth/google/callback").get(googleOAuthCallback)

// Secure routes
userRouter.route("/logout").post(authMiddleware, logoutUser)
userRouter.route("/auth-check").get(authMiddleware, (req, res) => res.json({ user: req.user }))
userRouter.route("/profile/edit-profile").put(authMiddleware, upload.single("profileImg"), eidtUserProfile)
userRouter.route("/refresh-access-token").post(refreshAccessToken)

export { userRouter }