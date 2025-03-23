import { type ErrorOptions } from "../ApiError";
import { BadRequestError } from "./BadRequestError";

/**
 * @openapi
 * components:
 *   schemas:
 *     ForbiddenErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BadRequestErrorResponse'
 *         - type: object
 *           properties:
 *             data:
 *               example:
 *                 endpoint: "/api/admin/users"
 *                 method: "GET"
 *                 errors: ["Permission denied"]
 *
 *   responses:
 *     Forbidden:
 *       description: Permission denied
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForbiddenErrorResponse'
 */
export class ForbiddenError extends BadRequestError {
  protected readonly _statusCode = 403;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
