/**
 * @openapi
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       required:
 *         - status
 *         - message
 *       properties:
 *         status:
 *           type: string
 *           enum: [error]
 *           description: Indicates an error occurred in the API
 *         message:
 *           type: string
 *           description: A meaningful, human-readable message describing the error
 *         code:
 *           type: integer
 *           description: Application-specific error code (optional)
 *         data:
 *           type: object
 *           nullable: true
 *           description: Optional data that might help with debugging
 *
 *     ApiErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Error'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 endpoint:
 *                   type: string
 *                   description: The API endpoint that generated the error
 *                 method:
 *                   type: string
 *                   description: The HTTP method used in the request
 *                 errors:
 *                   type: array
 *                   description: List of error messages
 *                   items:
 *                     type: string
 */
export interface JSendError {
  code?: number;
  data?: null | object;
  message: string;
  status: "error";
}

/**
 * @openapi
 * components:
 *   schemas:
 *     Fail:
 *       type: object
 *       required:
 *         - status
 *         - data
 *       properties:
 *         status:
 *           type: string
 *           enum: [fail]
 *           description: Indicates a failure in the API request (validation error, etc.)
 *         data:
 *           type: object
 *           nullable: true
 *           description: Contains validation errors or reasons for failure
 *
 *     ApiFailResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Fail'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 endpoint:
 *                   type: string
 *                   description: The API endpoint that generated the error
 *                 method:
 *                   type: string
 *                   description: The HTTP method used in the request
 *                 errors:
 *                   type: array
 *                   description: List of validation errors
 *                   items:
 *                     type: array
 *                     description: "[field, message] pairs for validation errors"
 *                     items:
 *                       oneOf:
 *                         - type: string
 *                         - type: object
 *                           properties:
 *                             field:
 *                               type: string
 *                             message:
 *                               type: string
 */
export interface JSendFail {
  data: null | object;
  status: "fail";
}

/**
 * @openapi
 * components:
 *   schemas:
 *     Success:
 *       type: object
 *       required:
 *         - status
 *         - data
 *       properties:
 *         status:
 *           type: string
 *           enum: [success]
 *           description: Indicates the API request was successful
 *         data:
 *           type: object
 *           nullable: true
 *           description: The actual content of the response
 */
export interface JSendSuccess {
  data: null | object;
  status: "success";
}

/**
 * @openapi
 * components:
 *   responses:
 *     ApiError:
 *       description: Generic API error response
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiErrorResponse'
 *
 *     ApiFail:
 *       description: Generic API failure response
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiFailResponse'
 *
 *     Success:
 *       description: Successful operation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Success'
 */
export type JSendResponse = JSendError | JSendFail | JSendSuccess;
export type JSendStatus = "error" | "fail" | "success";
