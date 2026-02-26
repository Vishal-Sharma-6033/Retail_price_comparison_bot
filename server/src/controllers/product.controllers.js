import {Product} from "../models/product.models.js";
import {Shop} from "../models/shop.models.js";
import {PriceListing} from "../models/priceListing.models.js";

const createProduct=async(req,res,next)=>{
        const { name, brand, category, description } = req.body;
        if(!name || !brand || !category){
            return res.status(400).json({ message: "name, brand and category are required" });
        }
        try {
            const product=await Product.create({
                owner: req.user._id,
                name,
                brand,
                category,
                description
            })
            return res.status(201).json({
                message:"Product created successfully",
                product
            })
            
        } catch (error) {
            return next(error);
        }

}

const ListProducts=async(req, res, next)=>{
    try {
        const {q}=req.query
        const query = q ? { $text: { $search: q } } : {};
        const products=await Product.find(query)
        return res.status(200).json({
            message:"Products listed successfully",
            products
        })
    } catch (error) {
        return next(error)
    }
}

const searchProducts=async(req, res, next)=>{
const { q, lat, lng, radius = 5000 } = req.query;
if(!q){
    return res.status(400).json({ message: "Search query (q) is required" });
}
try {
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
      .populate("Product")
      .populate("Shop");

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
    return next(error)
}
}

export {createProduct, ListProducts, searchProducts}