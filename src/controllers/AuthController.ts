import { Request } from "express";
import { Response } from "../types/res.json";
import { User } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IS_PRODUCTION, JWT_SECRET } from "../config/env";
import { UnauthorizedError, ConflictError } from "../errors";
import { z } from "zod";

function loginUser(userDocument: InstanceType<typeof User>, res: Response) {
  // strip password from returned user.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...user } = userDocument.toObject();

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin || false,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: IS_PRODUCTION, // Set to false for HTTP development testing
    sameSite: "lax", // Set to none to allow cross-site requests
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  });

  return user;
}

//TODO / UPDATE
export const register = async (req: Request, res: Response) => {
  const userData = z
    .object(
      {
        email: z.string().email({ message: "Please use a valid email." }),
        password: z
          .string()
          .min(8, { message: "Password must have at least 8 characters" })
          .max(25, "Password can have no more than 25 characters")
          .refine((pass) => /[A-Z]/.test(pass), {
            message: "Password must have at least one uppercase letter",
          })
          .refine((pass) => /[a-z]/.test(pass), {
            message: "Password must have at least one lowercase letter",
          })
          .refine((pass) => /[0-9]/.test(pass), {
            message: "Password must have at least one digit",
          })
          .refine((pass) => /[!@#$%^&*]/.test(pass), {
            message: "Password must have at least one special character",
          }),
        firstname: z.string(),
        lastname: z.string(),
        city: z.string(),
        street: z.string(),
        housenumber: z.string(),
        zipcode: z.string(),
        telephone: z.string(),
        isAdmin: z.boolean().default(false),
      },
      { message: "A Json body with user data is required" },
    )
    .parse(req.body);

  const { email, password } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ConflictError("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    ...userData,
    password: hashedPassword,
  });

  const loggedInUser = loginUser(newUser, res);

  res.status(201).json({ status: "success", data: { user: loggedInUser } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = z
    .object({
      email: z.string().email({ message: "Invalid Email" }),
      password: z.string(),
    })
    .parse(req.body);

  // One error msg to give as little info as possible.
  const invalidCredentialsMsg =
    "nope try again but with the correct credentials will ya?!";
  const user = await User.findOne({ email });
  if (!user) throw new UnauthorizedError(invalidCredentialsMsg);
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new UnauthorizedError(invalidCredentialsMsg);

  const loggedInUser = loginUser(user, res);

  res.status(200).json({ status: "success", data: { user: loggedInUser } });
};

export const logout = (req: Request, res: Response) => {
  res.cookie("token", "", {
    maxAge: 1,
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
  });
  res.status(200).json({ status: "success", data: null });
};
