import { Request, Response } from "express";
import { getItems } from "../services/itemService";
import { makePageLinkBuilder } from "../utils/pageLinkBuilder";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

export const renderItemsView = async (req: Request, res: Response) => {
  try {
    const { items, info } = await getItems(req.query, makePageLinkBuilder(req));

    const tokenFromCookie: string | undefined =
      typeof req.cookies?.token === "string" ? req.cookies.token : undefined;
    const tokenFromHeader: string | undefined =
      req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : undefined;
    const token: string | undefined = tokenFromCookie ?? tokenFromHeader;

    if (!token) {
      return res.redirect("/login");
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { isAdmin?: boolean };
      if (!decoded.isAdmin) {
        return res.redirect("/login");
      }
    } catch (error) {
      console.log(
        "Token verification error:",
        error instanceof Error ? error.message : "Unknown error",
      );
      return res.redirect("/login");
    }

    res.render("items", {
      items,
      info,
      title: "Poke-Mart Shop",
      sort: req.query.sort,
      order: req.query.order,
    });
  } catch (error) {
    console.log(
      "Error rendering items view:",
      error instanceof Error ? error.message : "Unknown error",
    );
    res.status(500).send("Internal Server Error");
  }
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
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { isAdmin?: boolean };
      if (decoded.isAdmin) {
        return res.redirect("/items");
      }
    } catch (error) {
      console.log(
        "Invalid token, rendering login page:",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

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

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { isAdmin?: boolean };
      if (decoded.isAdmin) {
        return res.render("register", {
          title: "Poke-Mart Register",
        });
      } else {
        return res.redirect("/login");
      }
    } catch (error) {
      console.log(
        "Register view - invalid token:",
        error instanceof Error ? error.message : "Unknown error",
      );
      return res.redirect("/login");
    }
  }

  return res.redirect("/login");
};
