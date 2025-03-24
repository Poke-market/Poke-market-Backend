import { type ErrorOptions } from "../ApiError";
import { BadRequestError } from "./BadRequestError";

/**
 * @openapi
 * components:
 *   schemas:
 *     TooManyRequestErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BadRequestErrorResponse'
 *         - type: object
 *           properties:
 *             data:
 *               example:
 *                 endpoint: "/api/login"
 *                 method: "POST"
 *                 errors: ["Rate limit exceeded, please try again later"]
 *
 *   responses:
 *     TooManyRequests:
 *       description: Rate limit exceeded
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TooManyRequestErrorResponse'
 */
export class TooManyRequestError extends BadRequestError {
  protected readonly _statusCode = 429;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    Object.setPrototypeOf(this, TooManyRequestError.prototype);
  }
}
