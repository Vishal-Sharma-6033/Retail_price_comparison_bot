import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import {
  addToWatchList,
  getUserProfile,
  getWastchList,
  removeFromWatchList,
} from "../controllers/user.controllers.js";

const router = Router();
router.route("/me").get(authenticateToken, getUserProfile);
router.route("/watchlist").get(authenticateToken, getWastchList);
router.route("/watchlist").post(authenticateToken, addToWatchList);
router
  .route("/watchlist/:productId")
  .delete(authenticateToken, removeFromWatchList);

export default router;
