const Product = require("../models/Product");
const Shop = require("../models/Shop");
const PriceListing = require("../models/PriceListing");

const createProduct = async (req, res, next) => {
  try {
    const { name, brand, category, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Product name is required" });
    }

    const product = await Product.create({ 
      name, 
      brand, 
      category, 
      description,
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
    const { q, lat, lng, radius = 5000 } = req.query;
    if (!q) {
      return res.status(400).json({ message: "q is required" });
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
