const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const {
  createShop,
  getNearbyShops,
  getMyShops,
  geocodeAddress
} = require("../controllers/shopController");

const router = express.Router();

router.get("/nearby", getNearbyShops);
router.get("/geocode", geocodeAddress);
router.get("/mine", authenticate, requireRole("shopkeeper", "admin"), getMyShops);
router.post("/", authenticate, requireRole("shopkeeper", "admin"), createShop);

module.exports = router;
