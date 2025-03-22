import { Request, Response } from "express";
import { getItems } from "../services/itemService";
import { makePageLinkBuilder } from "../utils/pageLinkBuilder";
import { logoutUser } from "../services/authService";
import { getUsers, getUserById } from "../services/userService";
import { categories, discountTypes } from "../models/itemModel";
import { getTags } from "../services/tagService";
import { getItemBySlug } from "../services/slugService";
import {
  FRONTEND_LIVE_URL,
  FRONTEND_DEV_URL,
  BACKEND_REPO_URL,
  FRONTEND_REPO_URL,
} from "../config/env";

export const renderHomeView = (req: Request, res: Response) => {
  res.render("home", {
    user: req.user,
    title: "Admin Dashboard",
    frontendLiveUrl: FRONTEND_LIVE_URL,
    frontendDevUrl: FRONTEND_DEV_URL,
    backendRepoUrl: BACKEND_REPO_URL,
    frontendRepoUrl: FRONTEND_REPO_URL,
  });
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
