import {Router} from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import { createProduct, ListProducts, searchProducts } from "../controllers/product.controllers.js";

const router = Router();
router.route("/").get(ListProducts)
router.route("/search").get(searchProducts) 
router.route("/").post(authenticateToken, createProduct) 

export default router;