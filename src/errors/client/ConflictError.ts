import { type ErrorOptions } from "../ApiError";
import { BadRequestError } from "./BadRequestError";

/**
 * @openapi
 * components:
 *   schemas:
 *     ConflictErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BadRequestErrorResponse'
 *         - type: object
 *           properties:
 *             data:
 *               example:
 *                 endpoint: "/api/users"
 *                 method: "POST"
 *                 errors: ["User with this email already exists"]
 *
 *   responses:
 *     Conflict:
 *       description: Resource conflict
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConflictErrorResponse'
 */
export class ConflictError extends BadRequestError {
  protected readonly _statusCode = 409;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
