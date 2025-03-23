import { type ErrorOptions } from "../ApiError";
import { BadRequestError } from "./BadRequestError";

/**
 * @openapi
 * components:
 *   schemas:
 *     NotFoundErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BadRequestErrorResponse'
 *         - type: object
 *           properties:
 *             data:
 *               example:
 *                 endpoint: "/api/items/999"
 *                 method: "GET"
 *                 errors: ["Resource not found"]
 *
 *   responses:
 *     NotFound:
 *       description: Requested resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotFoundErrorResponse'
 */
export class NotFoundError extends BadRequestError {
  protected readonly _statusCode = 404;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
