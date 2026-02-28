const Shop = require("../models/Shop");

const createShop = async (req, res, next) => {
  try {
    const { name, address, phone, latitude, longitude } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Shop name is required" });
    }

    const shop = await Shop.create({
      name,
      owner: req.user._id,
      address,
      phone,
      location: {
        type: "Point",
        coordinates: [Number(longitude) || 0, Number(latitude) || 0]
      }
    });

    return res.status(201).json({ shop });
  } catch (error) {
    return next(error);
  }
};

const getNearbyShops = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const shops = await Shop.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius)
        }
      }
    });

    return res.json({ shops });
  } catch (error) {
    return next(error);
  }
};

const getMyShops = async (req, res, next) => {
  try {
    const shops = await Shop.find({ owner: req.user._id });
    return res.json({ shops });
  } catch (error) {
    return next(error);
  }
};

const geocodeAddress = async (req, res, next) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ message: "address is required" });
    }

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(400).json({ message: "Google Maps API key is not configured" });
    }

    const encoded = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const payload = await response.json();

    if (!payload.results || payload.results.length === 0) {
      return res.status(404).json({ message: "No geocoding results" });
    }

    const { lat, lng } = payload.results[0].geometry.location;
    return res.json({ location: { lat, lng } });
  } catch (error) {
    return next(error);
  }
};

const deleteShop = async (req, res, next) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own shops" });
    }

    await Shop.findByIdAndDelete(shopId);
    return res.json({ message: "Shop deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createShop, getNearbyShops, getMyShops, geocodeAddress, deleteShop };
