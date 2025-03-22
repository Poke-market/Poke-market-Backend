import express from "express";
import itemViewRoutes from "./itemViewRoutes";
import authViewRoutes from "./authViewRoutes";
import userViewRoutes from "./userViewRoutes";
import homeViewRoutes from "./homeViewRoutes";

const router = express.Router();

// Mount all the view routes
router.use("/", homeViewRoutes);
router.use("/items", itemViewRoutes);
router.use("/auth", authViewRoutes);
router.use("/users", userViewRoutes);

export default router;
