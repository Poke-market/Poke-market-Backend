import { Request, Response } from "express";
import { getItems } from "../services/itemService";
import { makePageLinkBuilder } from "../utils/pageLinkBuilder";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

export const renderItemsView = async (req: Request, res: Response) => {
  const { items, info } = await getItems(req.query, makePageLinkBuilder(req));

  res.render("items", {
    items,
    info,
    title: "Poke-Mart Shop",
    sort: req.query.sort,
    order: req.query.order,
  });
};

export const renderLoginView = (req: Request, res: Response) => {
  const tokenFromCookie: string | undefined =
    typeof req.cookies?.token === "string" ? req.cookies.token : undefined;
  const tokenFromHeader: string | undefined =
    req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : undefined;
  const token: string | undefined = tokenFromCookie ?? tokenFromHeader;

  if (token) {
    jwt.verify(token, JWT_SECRET);
    return res.redirect("/items");
  }

  // If no token or invalid token, return to login page
  res.render("login", {
    title: "Poke-Mart Login",
  });
};

export const renderRegisterView = (req: Request, res: Response) => {
  const tokenFromCookie: string | undefined =
    typeof req.cookies?.token === "string" ? req.cookies.token : undefined;
  const tokenFromHeader: string | undefined =
    req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : undefined;
  const token: string | undefined = tokenFromCookie ?? tokenFromHeader;

  //if token available render register page
  if (token) {
    res.render("register", {
      title: "Poke-Mart Register",
    });
  }

  // If no token or invalid token, return to register page
  if (!token) {
    res.redirect("/login");
  }
};
