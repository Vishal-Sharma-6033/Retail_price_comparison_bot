const express = require("express");
const { authenticate } = require("../middleware/auth");
const {
  getMe,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", authenticate, getMe);
router.get("/watchlist", authenticate, getWatchlist);
router.post("/watchlist", authenticate, addToWatchlist);
router.delete("/watchlist/:productId", authenticate, removeFromWatchlist);

module.exports = router;
