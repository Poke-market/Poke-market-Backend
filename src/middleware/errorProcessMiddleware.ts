import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { ApiError, ValidationError } from "../errors";

// error responses are kept as uniform as possible while still following JSend
export const errorProcessMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Provide context with every error response
  const data = {
    endpoint: req.originalUrl,
    method: req.method,
  } as Record<string, unknown>;

  // Handle Known errors
  if (err instanceof ApiError) {
    const { logging, message, stack, status, statusCode, logMessage } = err;
    data.errors = [message];

    // add key to error if available
    if (err instanceof ValidationError) {
      data.errors = [[err.key, message]];
    }

    // log to console if enabled
    if (logging) {
      const errObj = {
        logMessage,
        ...data,
        status,
        statusCode,
      };
      console.error(errObj, stack);
    }

    res.status(statusCode).locals.processedError =
      status === "error" ? { status, data, message } : { status, data };
    next(err);
    return;
  }

  // Handle Zod Errors
  else if (err instanceof ZodError) {
    res.status(422).locals.processedError = {
      data: {
        ...data,
        errors: err.issues.map(({ message, path }) => [path[0], message]),
      },
      status: "fail",
    };
    next(err);
    return;
  }

  // Handle Unknown Errors
  console.error("errorObject:", JSON.stringify(err, null, 2));
  console.log("error:", err);
  const message = "Something went wrong";
  res.status(500).locals.processedError = {
    data: { ...data, errors: [message] },
    message,
    status: "error",
  };
  next(err);
  return;
};
