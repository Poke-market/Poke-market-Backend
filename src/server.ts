// Imports
import { PORT, MONGO_URI } from "./config/env";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import hbs from "./config/handlebars";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

import { notFound } from "./controllers/api/notFoundController";
import { errorProcessMiddleware } from "./middleware/errorProcessMiddleware";
import { errorSendMiddleware } from "./middleware/errorSendMiddleware";
import arcjetMiddleware from "./middleware/arcjetMiddleware";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/api";
import viewRoutes from "./routes/view";
import { getViewPaths } from "./config/handlebars";

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

app.set("views", getViewPaths("src/views"));
app.use(express.static("src/public"));

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
});

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
  console.log(
    `API Documentation available at http://localhost:${PORT}/api-docs`,
  );
});
