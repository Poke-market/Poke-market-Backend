import { BadRequestError } from "./BadRequestError";
import { type ErrorOptions } from "./CustomError";

export class NotFoundError extends BadRequestError {
  protected readonly _statusCode = 404;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, NotFoundError?.prototype);
  }
}
