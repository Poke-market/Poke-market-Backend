// Imports
import { PORT, MONGO_URI } from "./config/env";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import { notFound } from "./controllers/notFoundController";
import { errorHandler } from "./middleware/errorMiddleware";
import itemsRoutes from "./routes/itemsRoutes";
import tagRoutes from "./routes/tagRoutes";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import cookieParser from "cookie-parser";
// import localAuthMiddleware from "./middleware/authMiddleware";

// Variables
const app = express();

// Middleware
app.use(cors());

app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/items", itemsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/auth", authRoutes);
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
