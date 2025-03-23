import { ApiError, type ErrorOptions } from "../ApiError";

/**
 * @openapi
 * components:
 *   schemas:
 *     ServerErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiErrorResponse'
 *         - type: object
 *           properties:
 *             message:
 *               example: "Internal server error"
 *             data:
 *               example:
 *                 endpoint: "/api/items/123"
 *                 method: "GET"
 *                 errors: ["Something went wrong"]
 *
 *   responses:
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServerErrorResponse'
 */
export class ServerError extends ApiError {
  protected readonly _logging = false;
  protected readonly _status = "error";
  protected readonly _statusCode: number = 500;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}
