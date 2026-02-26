import {Router} from "express";
import { chatbotQuery } from "../controllers/chatbot.controllers.js";

const router = Router();

router.post("/query", chatbotQuery);

export default router;