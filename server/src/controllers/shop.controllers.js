import { Shop } from "../models/shop.models.js";


const createShop = async (req, res, next) => {
    try {
            const { name, address, phone, latitude, longitude } = req.body;
            if(!name){
                return res.status(400).json({ message: "name are required" });
            }
            console.log("Creating shop with data:", { name, address, phone, latitude, longitude });
            const shop= await Shop.create({
                owner: req.user._id,
                name,
                address,
                phone,
                location: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                }
             })

             return res.status(201).json({
                message:"Shop created successfully",
                shop
            })

    } catch (error) {
        return next(error);
    }
}

const getMyShops = async (req, res, next) => {
try {
    const shops = await Shop.find({ owner: req.user._id });
    return res.json({ shops });
  } catch (error) {
    return next(error);
  }
}

const getNearbyShops = async (req, res, next) => {
try {
    const { lat, lng, radius = 5000 } = req.query;
    if(!lat || !lng){
        return res.status(400).json({ message: "Latitude and longitude are required" });
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
}

const geocodeAddress = async (req, res, next) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ message: "address is required" });
    }

    if (!process.env.GEOCODE_API_KEY) {
      return res.status(400).json({ message: "Geocode API key is missing" });
    }

    const encoded = encodeURIComponent(address);

    const url = `https://geocode.maps.co/search?q=${encoded}&api_key=${process.env.GEOCODE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    return res.json({
      location: {
        lat: Number(data[0].lat),
        lng: Number(data[0].lon)
      }
    });

  } catch (error) {
    return next(error);
  }
};

export {createShop, getMyShops, getNearbyShops, geocodeAddress}