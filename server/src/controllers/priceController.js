const PriceListing = require("../models/PriceListing");
const PriceHistory = require("../models/PriceHistory");
const Notification = require("../models/Notification");
const Shop = require("../models/Shop");
const User = require("../models/User");

const createOrUpdatePrice = async (req, res, next) => {
  try {
    const { productId, shopId, price, currency, inStock } = req.body;

    if (!productId || !shopId || price === undefined) {
      return res.status(400).json({ message: "productId, shopId, and price are required" });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    if (req.user.role === "shopkeeper" && shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this shop" });
    }

    const existing = await PriceListing.findOne({ product: productId, shop: shopId });
    const previousPrice = existing ? existing.price : null;

    const listing = await PriceListing.findOneAndUpdate(
      { product: productId, shop: shopId },
      {
        price,
        currency: currency || existing?.currency || "USD",
        inStock: inStock ?? existing?.inStock ?? true,
        lastUpdated: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await PriceHistory.create({
      product: productId,
      shop: shopId,
      price
    });

    if (previousPrice !== null && price < previousPrice) {
      const watchers = await User.find({ watchlist: productId }).select("_id");
      if (watchers.length > 0) {
        const notifications = watchers.map((user) => ({
          user: user._id,
          product: productId,
          shop: shopId,
          previousPrice,
          newPrice: price
        }));
        await Notification.insertMany(notifications);
      }
    }

    return res.status(existing ? 200 : 201).json({ listing });
  } catch (error) {
    return next(error);
  }
};

const listPrices = async (req, res, next) => {
  try {
    const { productId, shopId } = req.query;
    const filter = {};
    if (productId) {
      filter.product = productId;
    }
    if (shopId) {
      filter.shop = shopId;
    }

    const listings = await PriceListing.find(filter).populate("product").populate("shop");
    return res.json({ listings });
  } catch (error) {
    return next(error);
  }
};

const getPriceHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { shopId } = req.query;
    const filter = { product: productId };
    if (shopId) {
      filter.shop = shopId;
    }

    const history = await PriceHistory.find(filter).sort({ recordedAt: 1 });
    return res.json({ history });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createOrUpdatePrice, listPrices, getPriceHistory };
