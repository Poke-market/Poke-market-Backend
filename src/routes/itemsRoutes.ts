import express from "express";

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
  .post("/", addItem)
  .delete("/:id", deleteItem)
  .get("/", getItems)
  .get("/name", getItemByName)
  .patch("/:id", updateItem)
  .get("/:id", getItemById)
  .post("/category", getItemsByCategory) //.get werkt niet
  .get("/category/:category", getItemsByCategoryQuerry)
  .get("/name/:name", getItemsByNameQuerry);

export default router;
