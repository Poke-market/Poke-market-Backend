import { ApiError, type ErrorOptions } from "../ApiError";

/**
 * @openapi
 * components:
 *   schemas:
 *     BadRequestErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiFailResponse'
 *         - type: object
 *           properties:
 *             data:
 *               example:
 *                 endpoint: "/api/items"
 *                 method: "POST"
 *                 errors: ["error message"]
 *
 *   responses:
 *     BadRequest:
 *       description: Bad request error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BadRequestErrorResponse'
 */
export class BadRequestError extends ApiError {
  protected readonly _logging = false;
  protected readonly _status = "fail";
  protected readonly _statusCode: number = 400;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
