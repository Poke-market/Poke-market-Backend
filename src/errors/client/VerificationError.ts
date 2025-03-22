import { type ErrorOptions } from "../ApiError";
import { BadRequestError } from "./BadRequestError";

export class VerificationError extends BadRequestError {
  constructor(
    type: "expired" | "already-verified" | "invalid-token" | "user-not-found",
    options?: ErrorOptions,
  ) {
    let message: string;
    let statusCode: number;
    switch (type) {
      case "expired":
        message = "Verification link has expired";
        statusCode = 410;
        break;
      case "already-verified":
        message = "Your account was already verified!";
        statusCode = 410;
        break;
      case "invalid-token":
        message = "Invalid or expired verification token.";
        statusCode = 400;
        break;
      case "user-not-found":
        message = "User not found";
        statusCode = 404;
        break;
    }

    super(message, { statusCode, ...options });

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, VerificationError.prototype);
  }
}
