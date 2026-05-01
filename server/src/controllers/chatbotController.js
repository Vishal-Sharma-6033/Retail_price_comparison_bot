const Product = require("../models/Product");
const Shop = require("../models/Shop");
const PriceListing = require("../models/PriceListing");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = geminiApiKey
  ? new GoogleGenerativeAI(geminiApiKey).getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.9,
      topP: 0.9,
      maxOutputTokens: 140
    }
  })
  : null;

const extractQuery = (question) => {
  const tokens = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);

  return tokens.join(" ").trim();
};

const humanizeFallbackAnswer = ({ question, product, listing }) => {
  const asked = (question || "that item").trim();
  return `Great choice. For ${asked}, the best nearby option I found is ${product.name} at ${listing.shop.name} for ${listing.price} ${listing.currency}.`;
};

const cleanModelAnswer = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const buildGeminiPrompt = ({ question, product, listing }) => {
  return [
    "You are Price Bot for a local retail comparison app.",
    "Respond in a friendly, conversational, human tone.",
    "Keep it to 1-2 short sentences.",
    "Avoid robotic phrasing like 'Best price is...'.",
    "Use only the trusted listing data below.",
    "Do not invent prices, shops, products, distances, or stock.",
    "If the user asks unrelated things, gently redirect to product-price help.",
    "",
    `User question: ${question}`,
    `Product: ${product.name}`,
    `Best price: ${listing.price} ${listing.currency}`,
    `Shop: ${listing.shop.name}`,
    `Shop address: ${listing.shop.address || "Not available"}`,
    `In stock: ${listing.inStock ? "Yes" : "No"}`
  ].join("\n");
};

const generateGeminiAnswer = async ({ question, product, listing }) => {
  if (!geminiModel) {
    return null;
  }

  try {
    const prompt = buildGeminiPrompt({ question, product, listing });
    const result = await geminiModel.generateContent(prompt);
    const answer = cleanModelAnswer(result?.response?.text?.());
    return answer || null;
  } catch (error) {
    console.error("Gemini response failed:", error.message);
    return null;
  }
};

const chatbotQuery = async (req, res, next) => {
  try {
    const { question, lat, lng, radius = 5000 } = req.body;
    if (!question) {
      return res.status(400).json({ message: "question is required" });
    }

    const cleaned = extractQuery(question);
    if (!cleaned) {
      return res.json({ answer: "Could you share the product name you want to compare? I will find the best nearby price." });
    }

    const product = await Product.findOne({
  $text: { $search: cleaned }
});

    if (!product) {
      return res.json({ answer: "I could not spot that product yet. Try a clearer name like 'iPhone 14' or 'Basmati rice 5kg' and I will check nearby prices." });
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

    const listingQuery = { product: product._id };
    if (shopFilter) {
      listingQuery.shop = shopFilter;
    }

    const listing = await PriceListing.findOne(listingQuery).sort({ price: 1 }).populate("shop");

    if (!listing) {
      return res.json({ answer: `I found ${product.name}, but there are no active price listings right now. Please try again shortly.` });
    }

    const fallbackAnswer = humanizeFallbackAnswer({ question, product, listing });
    const geminiAnswer = await generateGeminiAnswer({ question, product, listing });
    const answer = geminiAnswer || fallbackAnswer;
    return res.json({ answer, listing, product });
  } catch (error) {
    return next(error);
  }
};

module.exports = { chatbotQuery };