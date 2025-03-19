import express from "express";
import {
  renderItemsView,
  renderLoginView,
  renderRegisterView,
} from "../controllers/viewControllers";

const router = express.Router();

router.get("/items", renderItemsView);
router.get("/login", renderLoginView);
router.get("/register", renderRegisterView);

export default router;
