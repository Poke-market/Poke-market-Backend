import express from "express";
import {
  getItems,
  getItemById,
  updateItem,
  addItem,
  deleteItem,
  getItemByName,
} from "../../controllers/apiControllers/itemsController";

import { authMiddleware } from "../../middleware/authMiddleware";
import { isAdmin } from "../../middleware/isAdmin";

const router = express.Router();

// Public endpoints
router.get("/", getItems);
router.get("/name", getItemByName);
router.get("/:id", getItemById);

// Protected endpoints
router.post("/", authMiddleware, isAdmin, addItem);
router.patch("/:id", authMiddleware, isAdmin, updateItem);
router.delete("/:id", authMiddleware, isAdmin, deleteItem);

export default router;
