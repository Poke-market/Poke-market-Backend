import express from "express";
import {
  renderItemsView,
  renderItemEditView,
  renderItemAddView,
} from "../../controllers/view/itemViewControllers";
import { authMiddleware } from "../../middleware/authMiddleware";
import { isAdmin } from "../../middleware/isAdmin";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, renderItemsView);
router.get("/add", authMiddleware, isAdmin, renderItemAddView);
router.get("/:slug", authMiddleware, isAdmin, renderItemEditView);

export default router;
