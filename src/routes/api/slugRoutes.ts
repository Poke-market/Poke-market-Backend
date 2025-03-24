import express from "express";
import { getItemBySlug } from "../../controllers/api/SlugController";

/**
 * @openapi
 * tags:
 *   - name: Slugs
 *     description: Slug utilities
 */

const router = express.Router();

// Make this route public, no authentication middleware
router.get("/:slug", getItemBySlug);

export default router;
