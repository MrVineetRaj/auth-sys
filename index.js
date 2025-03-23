import "dotenv/config.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js"; // info : Don't forget to add .js it may cause some error

// importing routes
import userRoutes from "./routes/user.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL;

app.use(
  cors({
    origin: `${BASE_URL}:${PORT}`,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();
app.get("/", (req, res) => {
  res.json({
    message: "Hello my world 🌍",
  });
});

// info : routes starts with '/'
app.use("/api/v1/users", userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 App is up on ${BASE_URL}:${PORT}`);
});
