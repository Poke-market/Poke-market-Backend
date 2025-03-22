import express from "express";
import {
  renderLoginView,
  renderLogoutView,
  renderRegisterView,
  renderVerifyView,
} from "../../controllers/viewControllers/authViewControllers";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = express.Router();

router.get("/register", renderRegisterView);
router.get("/login", renderLoginView);
router.get("/logout", authMiddleware, renderLogoutView);
router.get("/verify/:token", renderVerifyView);

export default router;
