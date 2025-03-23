import express from "express";

import {
  addTag,
  deleteTag,
  getTagById,
  getTagByName,
  getTags,
  updateTag,
} from "../../controllers/api/tagController";
import { is } from "../../middleware/isMiddleware";

/**
 * @openapi
 * tags:
 *   - name: Tags
 *     description: Item tag management
 */

const router = express.Router();

router
  .get("/", getTags)
  .post("/", is("admin"), addTag)
  .delete("/:id", is("admin"), deleteTag)
  .patch("/:id", is("admin"), updateTag)
  .get("/:id", getTagById)
  .get("/name/:name", getTagByName);

export default router;
