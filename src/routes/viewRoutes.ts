import express from "express";
import {
  renderItemsView,
  renderLoginView,
  renderLogoutView,
  renderRegisterView,
  renderHomeView,
  renderUsersView,
  renderUserEditView,
  renderUserAddView,
  renderItemEditView,
  renderItemAddView,
} from "../controllers/viewControllers";
import { authMiddleware } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/isAdmin";
const router = express.Router();

router.get("/", authMiddleware, isAdmin, renderHomeView);
router.get("/items", authMiddleware, isAdmin, renderItemsView);
router.get("/items/add", authMiddleware, isAdmin, renderItemAddView);
router.get("/items/:slug", authMiddleware, isAdmin, renderItemEditView);

router.get("/register", renderRegisterView);
router.get("/login", renderLoginView);
router.get("/logout", authMiddleware, renderLogoutView);

router.get("/users", authMiddleware, isAdmin, renderUsersView);
router.get("/users/add", authMiddleware, isAdmin, renderUserAddView);
router.get("/users/:id", authMiddleware, isAdmin, renderUserEditView);

export default router;
