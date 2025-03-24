export interface ErrorOptionsBase {
  logging?: boolean;
  statusCode?: number;
}

export interface ErrorOptionsWithLogMessage extends ErrorOptionsBase {
  logging: true;
  logMessage: string;
}

export type ErrorOptions = ErrorOptionsBase | ErrorOptionsWithLogMessage;

/**
 * @openapi
 * components:
 *   schemas:
 *     ApiError:
 *       type: object
 *       description: Base class for all API errors
 *       required:
 *         - status
 *         - message
 *       properties:
 *         status:
 *           type: string
 *           enum: [error, fail]
 *           description: The error status (error or fail)
 *         message:
 *           type: string
 *           description: Error message
 */
export abstract class ApiError extends Error {
  get logging() {
    return this._options?.logging ?? this._logging;
  }
  get logMessage() {
    const options = this._options as ErrorOptionsWithLogMessage | undefined;
    return options?.logMessage;
  }
  get status() {
    return this._status;
  }
  get statusCode() {
    return this._options?.statusCode ?? this._statusCode;
  }

  protected abstract readonly _logging: boolean;
  protected abstract readonly _status: "error" | "fail";
  protected abstract readonly _statusCode: number;

  constructor(
    public message: string,
    private _options?: ErrorOptions,
  ) {
    super(message);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
