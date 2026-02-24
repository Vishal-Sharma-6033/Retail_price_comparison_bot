import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";


const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.use(express.json({limit:"1mb"})); // to parse JSON bodies

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export {app};