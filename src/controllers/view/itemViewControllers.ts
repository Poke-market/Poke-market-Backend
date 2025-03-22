import { Request, Response } from "express";
import { getItems } from "../../services/itemService";
import { makePageLinkBuilder } from "../../utils/pageLinkBuilder";
import { getItemBySlug } from "../../services/slugService";
import { categories, discountTypes } from "../../models/itemModel";
import { getTags } from "../../services/tagService";

export const renderItemsView = async (req: Request, res: Response) => {
  const { items, info } = await getItems(req.query, makePageLinkBuilder(req));

  res.render("items", {
    user: res.locals.user,
    items,
    info,
    title: "Poke-Mart Shop",
    sort: req.query.sort,
    order: req.query.order,
    search: req.query.search,
  });
};

export const renderItemAddView = async (req: Request, res: Response) => {
  // Get all tags for the tag selector
  const tags = await getTags();

  res.render("item-add", {
    user: res.locals.user,
    title: "Add New Item",
    categories,
    discountTypes,
    tags: tags.map((tag: { name: string }) => tag.name),
  });
};

export const renderItemEditView = async (req: Request, res: Response) => {
  const { slug } = req.params;

  // Get the item using the service
  const item = await getItemBySlug(slug);

  // Get all tags for the tag selector
  const tags = await getTags();

  res.render("item-edit", {
    user: res.locals.user,
    title: "Edit Item",
    itemDetails: item,
    categories,
    discountTypes,
    tags: tags.map((tag: { name: string }) => tag.name),
  });
};
