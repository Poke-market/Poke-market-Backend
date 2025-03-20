import { Request, NextFunction } from "express";
import { Response } from "../types/res.json";

export const errorSendMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (req.path.startsWith("/api")) {
    res.json(res.locals.processedError);
  } else {
    res.render("error", {
      user: req.user,
      message: err.message,
    });
  }
};
