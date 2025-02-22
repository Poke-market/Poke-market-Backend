import { CustomError, type ErrorOptions } from "./CustomError";

export class ServerError extends CustomError {
  protected readonly _logging = false;
  protected readonly _status = "error";
  protected readonly _statusCode: number = 500;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}
