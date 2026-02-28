const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const {
  createProduct,
  listProducts,
  searchProducts,
  deleteProduct,
  getMyProducts
} = require("../controllers/productController");

const router = express.Router();

router.get("/", listProducts);
router.get("/search", searchProducts);
router.get("/mine", authenticate, requireRole("shopkeeper", "admin"), getMyProducts);
router.post("/", authenticate, requireRole("shopkeeper", "admin"), createProduct);
router.delete("/:productId", authenticate, requireRole("shopkeeper", "admin"), deleteProduct);

module.exports = router;
