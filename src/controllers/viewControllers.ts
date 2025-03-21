import { Request } from "express";
import { Response } from "../types/res.json";
import { getItems } from "../services/itemService";
import { makePageLinkBuilder } from "../utils/pageLinkBuilder";
import { logoutUser } from "../services/authService";
import { User } from "../models/userModel";
import mongoose, { SortOrder } from "mongoose";
import { ValidationError, NotFoundError } from "../errors";

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
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortField = (req.query.sort as string) || "email";
  const sortOrder = (req.query.order as string) === "desc" ? -1 : 1;
  const search = req.query.search as string;

  const skip = (page - 1) * limit;

  // Build filter object based on search term if provided
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: "i" } },
      { firstname: { $regex: search, $options: "i" } },
      { lastname: { $regex: search, $options: "i" } },
    ];
  }

  // Count total users for pagination
  const total = await User.countDocuments(filter);
  const pages = Math.ceil(total / limit);

  // Sort options
  const sortOptions: Record<string, SortOrder> = {};
  sortOptions[sortField] = sortOrder;

  // Fetch users with pagination and sorting
  const users = await User.find(filter)
    .select("-password -verificationToken -resetToken")
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  // Build pagination links
  const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;
  const buildUrl = (p: number) => {
    const searchParams = new URLSearchParams(
      req.query as Record<string, string>,
    );
    searchParams.set("page", p.toString());
    return `${baseUrl}?${searchParams.toString()}`;
  };

  const paginationInfo = {
    page,
    pages,
    count: total,
    prev: page > 1 ? buildUrl(page - 1) : null,
    next: page < pages ? buildUrl(page + 1) : null,
    first: page > 1 ? buildUrl(1) : null,
    last: page < pages ? buildUrl(pages) : null,
  };

  res.render("users", {
    title: "User Management",
    users,
    info: paginationInfo,
    sort: sortField,
    order: sortOrder === -1 ? "desc" : "asc",
    search,
    user: res.locals.user,
  });
};

export const renderUserEditView = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ValidationError("id", "User ID is not valid");
  }

  const user = await User.findById(id).select(
    "-password -verificationToken -resetToken",
  );

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.render("user-edit", {
    title: "Edit User",
    userDetails: user,
    user: res.locals.user,
  });
};
