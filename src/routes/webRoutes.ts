import express from "express";
import { renderItemsView } from "../controllers/webControllers";

const router = express.Router();

router.get("/items", renderItemsView);

export default router;
