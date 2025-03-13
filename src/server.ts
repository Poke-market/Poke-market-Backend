// Imports
import { PORT, MONGO_URI } from "./config/env";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import hbs from "./config/handlebars";

import { notFound } from "./controllers/notFoundController";
import { errorHandler } from "./middleware/errorMiddleware";
import itemsRoutes from "./routes/itemsRoutes";
import tagRoutes from "./routes/tagRoutes";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import cookieParser from "cookie-parser";
import viewRoutes from "./routes/viewRoutes";
import slugRoutes from "./routes/slugRoutes";

// Variables
const app = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Handlebars view engine
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "src/views");
app.use(express.static("src/public"));

// API Routes
app.use("/api/items", itemsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/slug", slugRoutes);

// Web Routes
app.use("/", viewRoutes);

app.all("*splat", notFound);

// handle errors (this must be last)
app.use(errorHandler);

// Database connection
try {
  await mongoose.connect(MONGO_URI);
  console.log("Database connection OK");
} catch (err) {
  console.error(err);
  process.exit(1);
}

// Server Listening
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}! 🚀`);
});
