import { type ErrorOptions } from "../ApiError";
import { BadRequestError } from "./BadRequestError";

/**
 * @openapi
 * components:
 *   schemas:
 *     ValidationErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BadRequestErrorResponse'
 *         - type: object
 *           properties:
 *             data:
 *               example:
 *                 endpoint: "/api/users"
 *                 method: "POST"
 *                 errors: [["email", "Email is not valid"]]
 *
 *   responses:
 *     ValidationError:
 *       description: Request validation error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidationErrorResponse'
 */
export class ValidationError extends BadRequestError {
  protected readonly _statusCode = 422;

  constructor(
    readonly key: string,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
