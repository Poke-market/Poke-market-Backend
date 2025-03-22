import express from "express";
import {
  renderItemsView,
  renderLoginView,
  renderLogoutView,
  renderRegisterView,
  renderTestView,
  renderHomeView,
  renderUsersView,
  renderUserEditView,
  renderUserAddView,
} from "../controllers/viewControllers";
import { authMiddleware } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/isAdmin";
const router = express.Router();

router.get("/", authMiddleware, isAdmin, renderHomeView);
router.get("/items", authMiddleware, isAdmin, renderItemsView);
router.get("/login", renderLoginView);
router.get("/register", renderRegisterView);
router.get("/logout", renderLogoutView);
router.get("/test", renderTestView);
router.get("/users", authMiddleware, isAdmin, renderUsersView);
router.get("/users/add", authMiddleware, isAdmin, renderUserAddView);
router.get("/users/:id", authMiddleware, isAdmin, renderUserEditView);

export default router;
