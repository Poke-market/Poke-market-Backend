import express from "express";
import { getItems } from "../services/itemService";
import { makePageLinkBuilder } from "../utils/pageLinkBuilder";

const router = express.Router();

router.get("/", async (req, res) => {
  const { items, info } = await getItems(req.query, makePageLinkBuilder(req));

  res.render("items", {
    items,
    info,
    title: "Poke-Mart Shop",
  });
});

export default router;
