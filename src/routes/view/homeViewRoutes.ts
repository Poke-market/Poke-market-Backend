import express from "express";
import { renderHomeView } from "../../controllers/view/homeViewControllers";
import { authMiddleware } from "../../middleware/authMiddleware";
import { isAdmin } from "../../middleware/isAdmin";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, renderHomeView);

export default router;
