import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { User } from "../models/userModel";
import { UnauthorizedError } from "../errors";

// Define a custom interface for our JWT payload
interface CustomJwtPayload extends JwtPayload {
  _id?: string;
  email: string;
  isAdmin?: boolean;
}

// Middleware for web routes with redirection to login page
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token: string | undefined = req.headers.authorization?.startsWith(
    "Bearer",
  )
    ? req.headers.authorization.split(" ")[1]
    : (req.cookies?.token as string | undefined);

  if (!token) {
    throw new UnauthorizedError("No token provided");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;

  // Make sure we have an ID before proceeding
  const userId = decoded._id;
  if (!userId) {
    res.status(401).json({
      status: "fail",
      message: "Invalid token: No user ID found",
    });
    return;
  }

  const user = {
    _id: userId,
    email: decoded.email,
    isAdmin: decoded.isAdmin ?? false,
  };

  const userDetails = await User.findById(user._id).select("-password");
  if (!userDetails) {
    throw new UnauthorizedError("Invalid token: User no longer exists");
  }

  req.user = user;
  res.locals.user = userDetails;
  next();
};

export default authMiddleware;
