import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { notFound, errorHandler } from "./middlewares/errorhandlers.middlewares.js";
import authRoute from "./routes/auth.routes.js";
import  NotificationRoutes  from "./routes/notifications.routes.js";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import productRoute from "./routes/product.routes.js";
import priceRoute from "./routes/price.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({limit:"1mb"})); // to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded bodies

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/user",authRoute );
app.use("/api/notifications", NotificationRoutes);
app.use("/api/profile", userRouter);
app.use("/api/shops", shopRouter);
app.use("/api/products", productRoute);
app.use("/api/prices", priceRoute);
// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);



export {app};