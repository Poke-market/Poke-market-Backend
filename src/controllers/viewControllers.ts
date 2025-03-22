import { Request, Response } from "express";
import { getItems } from "../services/itemService";
import { makePageLinkBuilder } from "../utils/pageLinkBuilder";
import { logoutUser } from "../services/authService";
import { getUsers, getUserById } from "../services/userService";
import mongoose from "mongoose";
import {
  Item,
  categories,
  discountTypes,
  flattenItemTags,
} from "../models/itemModel";
import { Tag } from "../models/tagModel";

export const renderHomeView = (req: Request, res: Response) => {
  res.redirect("/items");
};

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

export const renderLoginView = (req: Request, res: Response) => {
  res.render("login", { title: "Login" });
};

export const renderRegisterView = (req: Request, res: Response) => {
  res.render("register", { title: "Register" });
};

export const renderLogoutView = (req: Request, res: Response) => {
  logoutUser(res);
  res.redirect("/login");
};

export const renderTestView = (req: Request, res: Response) => {
  res.status(200).json({ message: "Test view" });
};

export const renderUsersView = async (req: Request, res: Response) => {
  const { users, info } = await getUsers(req.query, makePageLinkBuilder(req));

  res.render("users", {
    user: res.locals.user,
    users,
    info,
    title: "User Management",
    sortBy: req.query.sort,
    order: req.query.order,
    search: req.query.search,
  });
};

export const renderUserEditView = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await getUserById(id);

  res.render("user-edit", {
    title: "Edit User",
    userDetails: user,
    user: res.locals.user,
  });
};

export const renderUserAddView = (req: Request, res: Response) => {
  res.render("user-add", {
    title: "Add New User",
    user: res.locals.user,
  });
};

export const renderItemAddView = async (req: Request, res: Response) => {
  // Get all tags for the tag selector
  const tags = await Tag.find().select("name");

  res.render("item-add", {
    user: res.locals.user,
    title: "Add New Item",
    categories,
    discountTypes,
    tags: tags.map((tag: { name: string }) => tag.name),
  });
};

export const renderItemEditView = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Check if id is valid
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid item ID");
    }

    // Get the item
    const item = await Item.findById(id).populate("tags");

    if (!item) {
      throw new Error("Item not found");
    }

    // Get all tags for the tag selector
    const tags = await Tag.find().select("name");

    // Convert to plain object and flatten tags
    const itemDetails = flattenItemTags(item.toObject());

    res.render("item-edit", {
      user: res.locals.user,
      title: "Edit Item",
      itemDetails,
      categories,
      discountTypes,
      tags: tags.map((tag: { name: string }) => tag.name),
    });
  } catch (error) {
    res.redirect("/items");
  }
};
