import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors";
import * as authService from "../services/authService";

// Middleware for web routes with redirection to login page
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const [isAuthenticated, userDetailOrError] =
    await authService.verifyToken(req);

  if (!isAuthenticated) {
    throw new UnauthorizedError(userDetailOrError);
  } else {
    req.user = userDetailOrError;
    res.locals.user = userDetailOrError;
    next();
  }
};

export default authMiddleware;
