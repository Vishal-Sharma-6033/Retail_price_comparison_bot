import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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

app.use(express.json({limit:"16kb"})); // to parse JSON bodies
app.use(express.urlencoded({extended:true,limit:"26kb"}));  // to parse URL-encoded bodies
app.use(express.static("public"));  // to serve static files from 'public' directory
app.use(cookieParser()); // to parse cookies

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export {app};