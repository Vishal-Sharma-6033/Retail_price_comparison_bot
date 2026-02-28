const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { connectDb } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const shopRoutes = require("./routes/shopRoutes");
const productRoutes = require("./routes/productRoutes");
const priceRoutes = require("./routes/priceRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const path = require("path");

require("dotenv").config();

const app = express();
const clientDistPath = path.resolve(__dirname, "../../client/dist");

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Connect to database once
let dbConnected = false;
const ensureDbConnection = async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDb();
      dbConnected = true;
    } catch (error) {
      console.error("Database connection failed:", error);
      return res.status(500).json({ message: "Database connection failed" });
    }
  }
  next();
};

app.use(ensureDbConnection);
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);
app.use(express.static(clientDistPath));
app.get("*", (_, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// Only start server if not in serverless environment
// if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
//   const port = process.env.PORT || 5000;
//   connectDb()
//     .then(() => {
//       dbConnected = true;
//       app.listen(port, () => {
//         console.log(`Server running on port ${port}`);
//       });
//     })
//     .catch((error) => {
//       console.error("Failed to connect to database", error);
//       process.exit(1);
//     });
// }
const port = process.env.PORT || 5000;
// Connect to MongoDB
connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    app.on("error", (error) => {
      console.error("Error in Express app:", error);
      throw error;
    });
  })
  .catch((err) => {
    console.log("Error in connecting to DB:", err);
  });

// Export for Vercel serverless
module.exports = app;
