import express from "express";

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
  .get("/", getAllUsers)
  .post("/", addUser)
  .get("/:id", getUser)
  .delete("/:id", deleteUser)
  .patch("/:id", updateUser)
  .post("/:id/wishlist", addToWishlist)
  .delete("/:id/wishlist", removeFromWishlist);

export default router;
