import express from "express";
import {
  renderItemsView,
  renderLoginView,
  renderRegisterView,
  renderTestView,
} from "../controllers/viewControllers";

const router = express.Router();

router.get("/items", renderItemsView);
router.get("/login", renderLoginView);
router.get("/register", renderRegisterView);
router.get("/test", renderTestView);

export default router;
