import { CustomError, type ErrorOptions } from "./CustomError";

export class NotFoundError extends CustomError {
  protected readonly _logging = false;
  protected readonly _status = "fail";
  protected readonly _statusCode = 404;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, NotFoundError?.prototype);
  }
}
