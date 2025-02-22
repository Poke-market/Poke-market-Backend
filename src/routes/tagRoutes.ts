import express from "express";

import {
  addTag,
  deleteTag,
  getTagById,
  getTagByName,
  getTags,
  updateTag,
} from "../controllers/tagController";

const router = express.Router();

router
  .get("/", getTags)
  .post("/", addTag)
  .delete("/:id", deleteTag)
  .patch("/:id", updateTag)
  .get("/:id", getTagById)
  .get("/name/:name", getTagByName);

export default router;
