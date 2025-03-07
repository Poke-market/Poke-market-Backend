import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors";

// Admin check middleware - use after authMiddleware
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.isAdmin !== true) {
    throw new ForbiddenError(
      "You do not have permission to perform this action",
    );
  }
  next();
};
