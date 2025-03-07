import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/isAdmin";

import {
  addItem,
  deleteItem,
  getItemById,
  getItemByName,
  getItems,
  getItemsByCategory,
  getItemsByCategoryQuerry,
  getItemsByNameQuerry,
  updateItem,
} from "../controllers/itemsController";

const router = express.Router();

router
  .post("/", authMiddleware, isAdmin, addItem)
  .delete("/:id", authMiddleware, isAdmin, deleteItem)
  .get("/", getItems)
  .get("/name", getItemByName)
  .patch("/:id", authMiddleware, isAdmin, updateItem)
  .get("/:id", getItemById)
  .post("/category", getItemsByCategory) //.get werkt niet
  .get("/category/:category", getItemsByCategoryQuerry)
  .get("/name/:name", getItemsByNameQuerry);

export default router;
