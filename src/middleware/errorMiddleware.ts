import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { ApiError, ValidationError } from "../errors";

// error responses are kept as uniform as possible while still following JSend
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // different body structures to comply with JSend
    const responseMap = {
      error: { data, message, status },
      fail: { data, status },
    };

    res.status(statusCode).json(responseMap[status]);
    return;
  }

  // Handle Zod Errors
  else if (err instanceof ZodError) {
    res.status(422).json({
      data: {
        ...data,
        errors: err.issues.map(({ message, path }) => [path[0], message]),
      },
      status: "fail",
    });
    return;
  }

  // Handle Unknown Errors
  console.error(JSON.stringify(err, null, 2));
  const message = "Something went wrong";
  res
    .status(500)
    .json({ data: { ...data, errors: [message] }, message, status: "error" });
  return;
};
