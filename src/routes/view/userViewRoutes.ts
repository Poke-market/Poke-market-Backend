import express from "express";
import {
  renderUsersView,
  renderUserEditView,
  renderUserAddView,
} from "../../controllers/view/userViewControllers";
import { authMiddleware } from "../../middleware/authMiddleware";
import { isAdmin } from "../../middleware/isAdmin";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, renderUsersView);
router.get("/add", authMiddleware, isAdmin, renderUserAddView);
router.get("/:id", authMiddleware, isAdmin, renderUserEditView);

export default router;
