// Imports
import { PORT, MONGO_URI } from "./config/env";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import hbs from "./config/handlebars";

import { notFound } from "./controllers/api/notFoundController";
import { errorProcessMiddleware } from "./middleware/errorProcessMiddleware";
import { errorSendMiddleware } from "./middleware/errorSendMiddleware";
import arcjetMiddleware from "./middleware/arcjetMiddleware";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/apiRoutes";
import viewRoutes from "./routes/viewRoutes";

// Variables
const app = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(arcjetMiddleware);

// Configure Handlebars view engine
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "src/views");
app.use(express.static("src/public"));

// API Routes
app.use("/api", apiRoutes);

// Web Routes
app.use("/", viewRoutes);

app.all("*splat", notFound);

// handle errors (this must be last)
app.use(errorProcessMiddleware);
app.use(errorSendMiddleware);

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
