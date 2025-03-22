import express from "express";
import {
  renderItemsView,
  renderItemEditView,
  renderItemAddView,
} from "../../controllers/viewControllers/itemViewControllers";
import { authMiddleware } from "../../middleware/authMiddleware";
import { isAdmin } from "../../middleware/isAdmin";

const router = express.Router();

router.get("/items", authMiddleware, isAdmin, renderItemsView);
router.get("/items/add", authMiddleware, isAdmin, renderItemAddView);
router.get("/items/:slug", authMiddleware, isAdmin, renderItemEditView);

export default router;
