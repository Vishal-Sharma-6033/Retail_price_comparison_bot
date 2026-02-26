import {Router} from "express";
import { authenticateToken} from "../middlewares/auth.middlewares.js";
import { createORupdatePriceHistory , getPriceHistory, listPriceHistory } from "../controllers/priceHistory.controllers.js";
import { requireRole } from "../middlewares/role.middlewares.js";
const router = Router();

router.get("/", listPriceHistory);
router.get("/history/:productId", getPriceHistory);
// router.route("/", authenticateToken, createORupdatePriceHistory);
router.route("/").post( authenticateToken, requireRole("shopkeeper", "admin"),createORupdatePriceHistory);

export default router;