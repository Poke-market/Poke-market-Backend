import { type ErrorOptions } from "../ApiError";
import { BadRequestError } from "./BadRequestError";

export class TooManyRequestError extends BadRequestError {
  protected readonly _statusCode = 429;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    Object.setPrototypeOf(this, TooManyRequestError.prototype);
  }
}
