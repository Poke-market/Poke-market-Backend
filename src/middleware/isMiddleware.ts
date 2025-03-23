import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors";

type RoleType = "admin" | "user" | "resourceOwner";

export const is =
  (role: RoleType | RoleType[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const allowedRoles = [role].flat();
    const userRoles: RoleType[] = ["user"];

    if (res.locals.user?.isAdmin) userRoles.push("admin");
    if (res.locals.user?._id.toString() === req.params.id)
      userRoles.push("resourceOwner");

    const hasPermission = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasPermission) {
      throw new ForbiddenError(
        "You do not have permission to perform this action",
      );
    }
    next();
  };
