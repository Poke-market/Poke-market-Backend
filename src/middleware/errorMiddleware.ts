import { NextFunction, Request, Response } from "express";

import { CustomError } from "../errors/CustomError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  // Known errors
  if (err instanceof CustomError) {
    const { logging, message, stack, status, statusCode } = err;
    if (logging) {
      const errObj = {
        message,
        stack,
        status,
        statusCode,
      };
      console.error(JSON.stringify(errObj, null, 2));
    }

    res.status(statusCode).json({ message, status });
    return;
  }
  // Unknown Errors
  console.error(JSON.stringify(err, null, 2));
  res.status(500).json({ message: "Something went wrong", status: "error" });
  return;
};
