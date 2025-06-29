import { authMiddleware } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { createSession, getSession, joinSession } from "../controllers/session.controller.js";

export const sessionRouter = Router()

sessionRouter.route("/create-session").post(authMiddleware, createSession)
sessionRouter.route("/get-session/:sessionId").get(authMiddleware, getSession)
sessionRouter.route("/join-session/:sessionId").post(authMiddleware, joinSession)