import { Request, NextFunction } from "express";
import { Response } from "../types/res.json";
import { UnauthorizedError } from "../errors";

export const errorSendMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (req.path.startsWith("/api")) {
    // we are sure that processedError is not undefined as it gets set in the previous middleware
    res.json(res.locals.processedError!);
    return;
  }

  if (err instanceof UnauthorizedError) {
    res.redirect("/login");
    return;
  }

  res.render("error", {
    user: req.user,
    message: err.message,
    statusCode: res.statusCode,
  });
};
