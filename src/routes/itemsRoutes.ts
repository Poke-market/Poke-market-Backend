import express from "express";

import { getItems } from "../controllers/itemsController";

const router = express.Router();

router.get("/", getItems);

export default router;
