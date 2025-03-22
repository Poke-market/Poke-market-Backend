import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/isAdmin";

import {
  addItem,
  deleteItem,
  getItemById,
  getItemByName,
  getItems,
  updateItem,
} from "../controllers/itemsController";

const router = express.Router();

router
  .post("/", authMiddleware, isAdmin, addItem)
  .delete("/:id", authMiddleware, isAdmin, deleteItem)
  .get("/", getItems)
  .get("/name", getItemByName)
  .patch("/:id", authMiddleware, isAdmin, updateItem)
  .get("/:id", getItemById);

export default router;
