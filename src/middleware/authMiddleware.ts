import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { User } from "../models/userModel";

// Define a custom interface for our JWT payload
interface CustomJwtPayload extends JwtPayload {
  id?: string;
  _id?: string;
  email: string;
  isAdmin?: boolean;
}

// Middleware for web routes with redirection to login page
export const localAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined;

    // Check for token in cookies
    if (req.cookies?.token) {
      token = req.cookies.token as string;
    }
    // Check for token in Authorization header
    else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.redirect("/login");
      return;
    }

    if (!JWT_SECRET) {
      res.status(500).json({ message: "No JWT_SECRET env" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;

    // Make sure we have an ID before proceeding
    const userId = decoded._id ?? decoded.id;
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
      res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists",
      });
      return;
    }

    req.user = user;
    res.locals.user = userDetails;
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

// Admin check middleware - use after protect middleware
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.isAdmin !== true) {
    res.status(403).json({
      status: "fail",
      message: "You do not have permission to perform this action",
    });
    return; // Add return statement to prevent execution of next()
  }
  next();
};

export default localAuthMiddleware;
