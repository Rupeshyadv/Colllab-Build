import { authMiddleware } from "../middlewares/auth.middleware.js";
import { Router } from "express";

export const assistantRouter = Router()

assistantRouter.route("/")