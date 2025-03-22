import express from "express";
import { getItemBySlug } from "../../controllers/apiControllers/SlugController";

const router = express.Router();

// Make this route public, no authentication middleware
router.get("/:slug", getItemBySlug);

export default router;
