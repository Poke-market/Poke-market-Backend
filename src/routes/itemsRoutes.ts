import express from "express";
import { localAuthMiddleware, isAdmin } from "../middleware/authMiddleware";

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
  .post("/", localAuthMiddleware, isAdmin, addItem)
  .delete("/:id", localAuthMiddleware, isAdmin, deleteItem)
  .get("/", getItems)
  .get("/name", getItemByName)
  .patch("/:id", localAuthMiddleware, isAdmin, updateItem)
  .get("/:id", getItemById)
  .post("/category", getItemsByCategory) //.get werkt niet
  .get("/category/:category", getItemsByCategoryQuerry)
  .get("/name/:name", getItemsByNameQuerry);

export default router;
