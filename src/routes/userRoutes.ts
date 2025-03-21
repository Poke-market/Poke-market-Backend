import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/isAdmin";

import {
  addToWishlist,
  addUser,
  deleteUser,
  getAllUsers,
  getUser,
  removeFromWishlist,
  updateUser,
} from "../controllers/userController";

const router = express.Router();

router
  .get("/", authMiddleware, isAdmin, getAllUsers)
  .post("/", addUser)
  .get("/:id", authMiddleware, isAdmin, getUser)
  .delete("/:id", authMiddleware, isAdmin, deleteUser)
  .patch("/:id", authMiddleware, isAdmin, updateUser)
  .post("/:id/wishlist", authMiddleware, addToWishlist)
  .delete("/:id/wishlist", authMiddleware, removeFromWishlist);

export default router;
