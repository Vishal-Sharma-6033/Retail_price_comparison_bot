import { Router } from "express";
import { listNotifications, markRead } from "../controllers/notification.controllers.js";
import { authenticateToken } from "../middlewares/auth.middlewares.js";

const router = Router();

// Protected routes - require authentication
router.route("/listNotifications").get(authenticateToken, listNotifications)
router.route("/markRead/:id").post(authenticateToken, markRead)

export default router;