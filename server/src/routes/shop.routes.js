import {Router} from "express";
import { createShop, geocodeAddress, getMyShops, getNearbyShops } from "../controllers/shop.controllers.js";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
// import { requireRole } from "../middlewares/role.middlewares.js";

const router = Router();


router.route("/nearby").get(getNearbyShops)
router.route("/geocode").get(geocodeAddress)
router.route("/mine").get(authenticateToken,getMyShops);
router.route("/").post(authenticateToken,createShop);

export default router;















// router.get("/nearby", getNearbyShops);
// router.get("/geocode", geocodeAddress);
// router.get("/mine", authenticate, requireRole("shopkeeper", "admin"), getMyShops);
// router.post("/", authenticate, requireRole("shopkeeper", "admin"), createShop);