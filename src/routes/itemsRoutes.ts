import express from "express";
import { getItems, addItem, updateItem } from "../controllers/itemsController";

const router = express.Router();

router.get("/", getItems).post("/", addItem).patch("/:id", updateItem);

export default router;
