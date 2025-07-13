import { authMiddleware } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { createSession, getSessions, joinSession } from "../controllers/session.controller.js";

export const sessionRouter = Router()

sessionRouter.route("/create-session").post(authMiddleware, createSession)
sessionRouter.route("/get-sessions").get(authMiddleware, getSessions)
sessionRouter.route("/join-session/:sessionId").post(authMiddleware, joinSession)