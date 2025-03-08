import express from "express";
import { renderItemsView } from "../controllers/viewControllers";

const router = express.Router();

router.get("/items", renderItemsView);

export default router;
