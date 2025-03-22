import express from "express";
import itemsRoutes from "./itemsRoutes";
import tagRoutes from "./tagRoutes";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import slugRoutes from "./slugRoutes";

const router = express.Router();

// Mount all the API routes
router.use("/items", itemsRoutes);
router.use("/tags", tagRoutes);
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/slugs", slugRoutes);

export default router;
