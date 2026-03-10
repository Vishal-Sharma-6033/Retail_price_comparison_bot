const Product = require("../models/Product");
const Shop = require("../models/Shop");
const PriceListing = require("../models/PriceListing");
const User = require("../models/User");
const {
  getAvailablePaidPlans,
  getEffectiveSubscription,
  getPlanConfig
} = require("../utils/subscription");

const buildLimitResponse = ({ resource, usage, limits, currentPlan }) => ({
  code: "SUBSCRIPTION_REQUIRED",
  message: `Your ${currentPlan.name} plan allows ${limits[resource]} ${resource}. Upgrade to continue.`,
  resource,
  usage,
  limits,
  currentPlan: currentPlan.code,
  availablePlans: getAvailablePaidPlans()
});

const normalizeInput = (value = "") => value.trim().replace(/\s+/g, " ");
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const buildLooseExactRegex = (value = "") => {
  const normalized = normalizeInput(value);
  if (!normalized) {
    return null;
  }

  const pattern = normalized
    .split(" ")
    .map((word) => escapeRegex(word))
    .join("\\s+");

  return new RegExp(`^\\s*${pattern}\\s*$`, "i");
};

const buildEmptyFieldCondition = (fieldName) => ({
  $or: [
    { [fieldName]: { $exists: false } },
    { [fieldName]: null },
    { [fieldName]: "" },
    { [fieldName]: /^\s*$/ }
  ]
});

const trackSearchActivity = async (userId, queryText, addressText) => {
  const query = normalizeInput(queryText || "");
  if (!userId || !query) {
    return;
  }

  const address = normalizeInput(addressText || "");
  const entry = {
    query,
    searchedAt: new Date()
  };

  if (address) {
    entry.address = address;
  }

  await User.findByIdAndUpdate(userId, {
    $push: {
      recentSearches: {
        $each: [entry],
        $position: 0,
        $slice: 20
      }
    },
    $inc: { totalSearches: 1 }
  });
};

const createProduct = async (req, res, next) => {
  try {
    const name = normalizeInput(req.body.name || "");
    const brand = normalizeInput(req.body.brand || "");
    const category = normalizeInput(req.body.category || "");
    const description = normalizeInput(req.body.description || "");

    if (!name) {
      return res.status(400).json({ message: "Product name is required" });
    }

    if (req.user.role === "shopkeeper") {
      const freshUser = await User.findById(req.user._id).select("role subscription");
      const subscription = getEffectiveSubscription(freshUser || req.user);
      const currentPlan = getPlanConfig(subscription?.plan);
      const limits = currentPlan.limits;
      const currentProductCount = await Product.countDocuments({ owner: req.user._id });

      if (typeof limits.products === "number" && currentProductCount >= limits.products) {
        return res.status(402).json(
          buildLimitResponse({
            resource: "products",
            usage: { products: currentProductCount },
            limits,
            currentPlan
          })
        );
      }
    }

    const duplicateQuery = {
      $and: [
        { owner: req.user._id },
        { name: buildLooseExactRegex(name) },
        brand ? { brand: buildLooseExactRegex(brand) } : buildEmptyFieldCondition("brand"),
        category ? { category: buildLooseExactRegex(category) } : buildEmptyFieldCondition("category")
      ]
    };

    const duplicate = await Product.findOne(duplicateQuery).select("_id name brand category");
    if (duplicate) {
      return res.status(409).json({
        message: "Duplicate product detected. A matching product already exists.",
        duplicateProductId: duplicate._id
      });
    }

    const product = await Product.create({ 
      name, 
      brand: brand || undefined,
      category: category || undefined,
      description: description || undefined,
      owner: req.user._id 
    });
    return res.status(201).json({ product });
  } catch (error) {
    return next(error);
  }
};

const listProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    const query = q ? { $text: { $search: q } } : {};
    const products = await Product.find(query).limit(50);
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const { q, lat, lng, radius = 5000, address } = req.query;
    if (!q) {
      return res.status(400).json({ message: "q is required" });
    }

    if (req.user?._id) {
      trackSearchActivity(req.user._id, q, address).catch(() => {
        // Search activity tracking should not block search results.
      });
    }

    const productQuery = { $text: { $search: q } };
    const products = await Product.find(productQuery).limit(20);

    if (products.length === 0) {
      return res.json({ results: [] });
    }

    let shopFilter = null;
    if (lat && lng) {
      const nearby = await Shop.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
            $maxDistance: Number(radius)
          }
        }
      });

      shopFilter = { $in: nearby.map((shop) => shop._id) };
    }

    const listingQuery = {
      product: { $in: products.map((product) => product._id) }
    };

    if (shopFilter) {
      listingQuery.shop = shopFilter;
    }

    const listings = await PriceListing.find(listingQuery)
      .populate("product")
      .populate("shop");

    const resultsMap = new Map();
    listings.forEach((listing) => {
      const productId = listing.product._id.toString();
      const current = resultsMap.get(productId);
      if (!current || listing.price < current.bestPrice) {
        resultsMap.set(productId, {
          product: listing.product,
          bestPrice: listing.price,
          currency: listing.currency,
          shop: listing.shop
        });
      }
    });

    return res.json({ results: Array.from(resultsMap.values()) });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own products" });
    }

    await Product.findByIdAndDelete(productId);
    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ owner: req.user._id });
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createProduct, listProducts, searchProducts, deleteProduct, getMyProducts };
