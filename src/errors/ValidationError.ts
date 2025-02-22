import { BadRequestError } from "./BadRequestError";
import { type ErrorOptions } from "./CustomError";

export class ValidationError extends BadRequestError {
  protected readonly _statusCode = 422;

  constructor(
    readonly key: string,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    // Only because we are extending a built in class
    Object.setPrototypeOf(this, ValidationError?.prototype);
  }
}
