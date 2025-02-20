export interface ErrorOptions {
  logging?: boolean;
  statusCode?: number;
}

export abstract class CustomError extends Error {
  get logging() {
    return this._options?.logging ?? this._logging;
  }
  get status() {
    return this._status;
  }
  get statusCode() {
    return this._options?.statusCode ?? this._statusCode;
  }

  protected abstract readonly _logging: boolean;
  protected abstract readonly _status: "error" | "fail" | "success";
  protected abstract readonly _statusCode: number;

  constructor(
    public message: string,
    private _options?: ErrorOptions,
  ) {
    super(message);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
