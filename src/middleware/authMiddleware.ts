import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { User } from "../models/userModel";
import { UnauthorizedError } from "../errors";
import { z } from "zod";

// Define a custom interface for our JWT payload
const JwtPayloadSchema = z.object({
  _id: z.string({ message: "No User ID found" }),
  email: z
    .string({ message: "No Email found" })
    .email({ message: "Invalid Email" }),
  isAdmin: z.boolean({ message: "admin has to be a boolean" }).default(false),
});

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

  const decoded = jwt.verify(token, JWT_SECRET);
  const parsedJwt = JwtPayloadSchema.safeParse(decoded);

  if (!parsedJwt.success) {
    const issue = parsedJwt.error.issues[0];
    throw new UnauthorizedError(`Invalid token: ${issue.message}`);
  }

  const user = parsedJwt.data;

  const userDetails = await User.findById(user._id).select("-password");
  if (!userDetails) {
    throw new UnauthorizedError("Invalid token: User no longer exists");
  }

  req.user = user;
  res.locals.user = userDetails;
  next();
};

export default authMiddleware;
