import { type ErrorOptions } from "../ApiError";
import { BadRequestError } from "./BadRequestError";

export class ConflictError extends BadRequestError {
  protected readonly _statusCode = 409;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
