import { Request, Response } from "express";
import { getUsers, getUserById } from "../../services/userService";
import { makePageLinkBuilder } from "../../utils/pageLinkBuilder";

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
