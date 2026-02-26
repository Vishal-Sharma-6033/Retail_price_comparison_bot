const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const {
  createProduct,
  listProducts,
  searchProducts
} = require("../controllers/productController");

const router = express.Router();

router.get("/", listProducts);
router.get("/search", searchProducts);
router.post("/", authenticate, requireRole("shopkeeper", "admin"), createProduct);

module.exports = router;
