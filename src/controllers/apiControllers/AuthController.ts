import { Request } from "express";
import { Response } from "../../types/res.json";
import * as authService from "../../services/authService";
const { registerSchema, loginSchema } = authService;

export const register = async (req: Request, res: Response) => {
  const userData = registerSchema.parse(req.body);
  const newUser = await authService.registerUser(userData);
  const loggedInUser = authService.loginUser(newUser, res);

  res.status(201).json({ status: "success", data: { user: loggedInUser } });
};

export const login = async (req: Request, res: Response) => {
  // Parse the request body (Zod errors will be caught by middleware)
  const { email, password } = loginSchema.parse(req.body);

  const user = await authService.validateLogin(email, password);
  const loggedInUser = authService.loginUser(user, res);

  res.status(200).json({ status: "success", data: { user: loggedInUser } });
};

export const logout = (req: Request, res: Response) => {
  authService.logoutUser(res);
  res.status(200).json({ status: "success", data: null });
};

export const verify = async (req: Request, res: Response) => {
  const { token } = req.params;
  const user = await authService.verifyUser(token);
  res.status(200).json({ status: "success", data: { user } });
};
