import express from "express";
import { localAuthMiddleware } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/authMiddleware";

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
  .get("/", localAuthMiddleware, isAdmin, getAllUsers)
  .post("/", addUser)
  .get("/:id", localAuthMiddleware, isAdmin, getUser)
  .delete("/:id", localAuthMiddleware, isAdmin, deleteUser)
  .patch("/:id", localAuthMiddleware, isAdmin, updateUser)
  .post("/:id/wishlist", localAuthMiddleware, addToWishlist)
  .delete("/:id/wishlist", localAuthMiddleware, removeFromWishlist);

export default router;
