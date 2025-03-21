import { Request, Response } from "express";
import { getItems } from "../services/itemService";
import { makePageLinkBuilder } from "../utils/pageLinkBuilder";
import { logoutUser } from "../services/authService";
import { getUsers, getUserById } from "../services/userService";

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
  });
};

export const renderLoginView = (req: Request, res: Response) => {
  res.render("login", {
    title: "Poke-Mart Login",
  });
};

export const renderRegisterView = (req: Request, res: Response) => {
  res.render("register", {
    title: "Poke-Mart Register",
  });
};

export const renderLogoutView = (req: Request, res: Response) => {
  logoutUser(res);
  res.redirect("/login");
};

export const renderTestView = (req: Request, res: Response) => {
  res.render("error", {
    user: res.locals.user,
    message: "This is a test error",
    details: "This is a test error details",
  });
};

export const renderUsersView = async (req: Request, res: Response) => {
  const { users, info } = await getUsers(req.query, makePageLinkBuilder(req));

  res.render("users", {
    title: "User Management",
    users,
    info,
    sortBy: req.query.sort,
    order: req.query.order,
    search: req.query.search,
    user: res.locals.user,
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
