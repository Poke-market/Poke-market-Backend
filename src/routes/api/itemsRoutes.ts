import express from "express";
import {
  getItems,
  getItemById,
  updateItem,
  addItem,
  deleteItem,
  getItemByName,
} from "../../controllers/api/itemsController";

import { authMiddleware } from "../../middleware/authMiddleware";
import { is } from "../../middleware/isMiddleware";

/**
 * @openapi
 * tags:
 *   - name: Items
 *     description: Item management
 */

const router = express.Router();

// Public endpoints
router.get("/", getItems);
router.get("/name", getItemByName);
router.get("/:id", getItemById);

// Protected endpoints
router.post("/", authMiddleware, is("admin"), addItem);
router.patch("/:id", authMiddleware, is("admin"), updateItem);
router.delete("/:id", authMiddleware, is("admin"), deleteItem);

export default router;
