import { Request } from "express";
import { Response } from "../../types/res.json";
import * as authService from "../../services/authService";
const { registerSchema, loginSchema, verifyBaseUrlSchema } = authService;

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user and return access/refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             email:
 *                               type: string
 *                             name:
 *                               type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const login = async (req: Request, res: Response) => {
  // Parse the request body (Zod errors will be caught by middleware)
  const { email, password } = loginSchema.parse(req.body);

  const user = await authService.validateLogin(email, password);
  const loggedInUser = authService.loginUser(user, res);

  res.status(200).json({ status: "success", data: { user: loggedInUser } });
};

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logs out the current user by clearing cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: null
 */
export const logout = (req: Request, res: Response) => {
  authService.logoutUser(res);
  res.status(200).json({ status: "success", data: null });
};

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: verifyBaseUrl
 *         schema:
 *           type: string
 *         description: Base URL for verification link (optional)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstname
 *               - lastname
 *               - city
 *               - street
 *               - housenumber
 *               - zipcode
 *               - telephone
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min 8 chars with uppercase, lowercase, digit, special char)
 *               firstname:
 *                 type: string
 *                 description: User's first name
 *               lastname:
 *                 type: string
 *                 description: User's last name
 *               city:
 *                 type: string
 *                 description: User's city
 *               street:
 *                 type: string
 *                 description: User's street
 *               housenumber:
 *                 type: string
 *                 description: User's house number
 *               zipcode:
 *                 type: string
 *                 description: User's zip code
 *               telephone:
 *                 type: string
 *                 description: User's telephone number
 *     responses:
 *       201:
 *         description: Registration successful, verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             email:
 *                               type: string
 *                             firstname:
 *                               type: string
 *                             lastname:
 *                               type: string
 *                             isAdmin:
 *                               type: boolean
 *                             isVerified:
 *                               type: boolean
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const register = async (req: Request, res: Response) => {
  const userData = registerSchema.parse(req.body);
  const { verifyBaseUrl } = verifyBaseUrlSchema.parse(req.query);
  const newUser = await authService.registerUser(userData, verifyBaseUrl);
  const loggedInUser = authService.loginUser(newUser, res);

  res.status(201).json({ status: "success", data: { user: loggedInUser } });
};

/**
 * @openapi
 * /auth/verify/{token}:
 *   get:
 *     summary: Verify user email
 *     description: Verify a user's email address using the token sent in the verification email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token
 *     responses:
 *       200:
 *         description: Email verification successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       410:
 *         $ref: '#/components/responses/VerificationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const verify = async (req: Request, res: Response) => {
  const { token } = req.params;
  const user = await authService.verifyUser(token);
  res.status(200).json({ status: "success", data: { user } });
};
