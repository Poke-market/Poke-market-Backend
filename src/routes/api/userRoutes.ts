import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { isAdmin } from "../../middleware/isAdmin";
import { is } from "../../middleware/isMiddleware";

import {
  addToWishlist,
  addUser,
  deleteUser,
  getAllUsers,
  getUser,
  getWishlist,
  removeFromWishlist,
  updateUser,
  replaceUser,
} from "../../controllers/api/userController";

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: User management
 */

const router = express.Router();

router
  .get("/", authMiddleware, isAdmin, getAllUsers)
  .post("/", addUser)
  .get("/:id", authMiddleware, is(["admin", "resourceOwner"]), getUser)
  .delete("/:id", authMiddleware, is("admin"), deleteUser)
  .patch("/:id", authMiddleware, is(["admin", "resourceOwner"]), updateUser)
  .put("/:id", authMiddleware, is(["admin", "resourceOwner"]), replaceUser)
  .get(
    "/:id/wishlist",
    authMiddleware,
    is(["admin", "resourceOwner"]),
    getWishlist,
  )
  .post(
    "/:id/wishlist",
    authMiddleware,
    is(["admin", "resourceOwner"]),
    addToWishlist,
  )
  .delete(
    "/:id/wishlist",
    authMiddleware,
    is(["admin", "resourceOwner"]),
    removeFromWishlist,
  );

export default router;
