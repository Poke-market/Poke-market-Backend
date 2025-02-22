import { type ErrorOptions } from "../ApiError";
import { BadRequestError } from "./BadRequestError";

export class UnauthorizedError extends BadRequestError {
  protected readonly _statusCode = 401;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
