import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { notFound, errorHandler } from "./middlewares/errorhandlers.middlewares.js";
import userRoutes from "./routes/auth.routes.js";
import  NotificationRoutes  from "./routes/notifications.routes.js";

const app = express();

// Middleware
// app.use(cors({
//     origin:process.env.CORS_ORIGIN,
//     credentials:true
// }))
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
app.use("/api/user",userRoutes );
app.use("/api/notifications", NotificationRoutes);

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);



export {app};