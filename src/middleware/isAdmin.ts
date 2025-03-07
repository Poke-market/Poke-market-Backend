import { NextFunction, Request, Response } from "express";

// Admin check middleware - use after authMiddleware
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.isAdmin !== true) {
    res.status(403).json({
      status: "fail",
      message: "You do not have permission to perform this action",
    });
    return; // Add return statement to prevent execution of next()
  }
  next();
};
