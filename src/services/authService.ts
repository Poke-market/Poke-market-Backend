import { User } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { BASE_URL, IS_PRODUCTION, JWT_SECRET } from "../config/env";
import { UnauthorizedError, ConflictError, VerificationError } from "../errors";
import { z } from "zod";
import { sendVerificationEmail } from "../utils/sendVerificationMail";
import { Response } from "../types/res.json";

export const verifyEmailJwtSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid Token: token does not contain email" }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid Email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const registerSchema = z.object({
  email: z.string().email({ message: "Please use a valid email." }),
  password: z
    .string()
    .min(8, { message: "Password must have at least 8 characters" })
    .max(25, { message: "Password can have no more than 25 characters" })
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
  firstname: z.string().min(1, { message: "First name is required" }),
  lastname: z.string().min(1, { message: "Last name is required" }),
  city: z.string().min(1, { message: "City is required" }),
  street: z.string().min(1, { message: "Street is required" }),
  housenumber: z.string().min(1, { message: "House number is required" }),
  zipcode: z.string().min(1, { message: "Zip code is required" }),
  telephone: z.string().min(1, { message: "Telephone is required" }),
});

export async function validateLogin(email: string, password: string) {
  // One error msg to give as little info as possible.
  const invalidCredentialsMsg = "Invalid email or password";

  const user = await User.findOne({ email });
  if (!user) throw new UnauthorizedError(invalidCredentialsMsg);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new UnauthorizedError(invalidCredentialsMsg);

  return user;
}

export function loginUser(
  userDocument: InstanceType<typeof User>,
  res: Response,
) {
  // strip password from returned user.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...user } = userDocument.toObject();

  const token = jwt.sign(
    {
      _id: user._id,
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

export async function registerUser(userData: z.infer<typeof registerSchema>) {
  const { email, password } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ConflictError("User is already registered");

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = jwt.sign({ email }, JWT_SECRET, {
    expiresIn: "1h",
  });

  const verificationLink = `${BASE_URL}/auth/verify/${verificationToken}`;

  await sendVerificationEmail({
    name: userData.firstname,
    email: userData.email,
    type: "verify",
    link: verificationLink,
  });

  const newUser = await User.create({
    ...userData,
    password: hashedPassword,
    verificationToken,
  });

  return newUser;
}

export function logoutUser(res: Response) {
  res.cookie("token", "", {
    maxAge: 1,
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
  });
}

export async function verifyUser(token: string) {
  if (!token || typeof token !== "string")
    throw new VerificationError("invalid-token");

  // Verify the token
  const decoded = jwt.verify(token, JWT_SECRET);

  const { success, data } = verifyEmailJwtSchema.safeParse(decoded);
  if (!success) throw new VerificationError("invalid-token");

  // Find the user by email
  const user = await User.findOne({ email: data.email });

  if (!user) throw new VerificationError("user-not-found");

  if (user.isVerified) throw new VerificationError("already-verified");

  // Update user verification status
  user.isVerified = true;
  user.verificationToken = null;
  await user.save();

  return user;
}
