import { Request } from "express";
import { Response } from "../types/res.json";
import { User } from "../models/userModel";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import {
  loginSchema,
  registerSchema,
  loginUser,
  registerUser,
  logoutUser,
  validateLogin,
} from "../services/authService";

export const register = async (req: Request, res: Response) => {
  const userData = registerSchema.parse(req.body);
  const newUser = await registerUser(userData);
  const loggedInUser = loginUser(newUser, res);

  res.status(201).json({ status: "success", data: { user: loggedInUser } });
};

export const login = async (req: Request, res: Response) => {
  // Parse the request body (Zod errors will be caught by middleware)
  const { email, password } = loginSchema.parse(req.body);

  const user = await validateLogin(email, password);
  const loggedInUser = loginUser(user, res);

  res.status(200).json({ status: "success", data: { user: loggedInUser } });
};

export const logout = (req: Request, res: Response) => {
  logoutUser(res);
  res.status(200).json({ status: "success", data: null });
};

export const verificationEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.render("verification", {
        title: "Verification Failed",
        message: "Invalid verification token provided.",
      });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Find the user by email
      const user = await User.findOne({
        email: (decoded as { email: string }).email,
      });

      if (!user) {
        return res.render("verification", {
          title: "Verification Failed",
          message: "User not found. Please register again.",
        });
      }

      if (user.isVerified) {
        return res.render("verification", {
          title: "Already Verified",
          message: "Your account was already verified!",
        });
      }

      // Update user verification status
      user.isVerified = true;
      user.verificationToken = null;
      await user.save();

      return res.render("verification", {
        title: "Verification Successful!",
        message: "Congratulations! Your account has been verified.!",
      });
    } catch {
      return res.render("verification", {
        title: "Verification Failed",
        message:
          "Invalid or expired verification token. Please request a new verification email.",
      });
    }
  } catch {
    console.error("Verification error:");
    return res.render("verification", {
      title: "Verification Error",
      message:
        "An unexpected error occurred during verification. Please try again later.",
    });
  }
};
