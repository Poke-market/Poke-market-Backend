import { Request, Response } from "express";
import { User } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, NODE_ENV } from "../config/env";
import validator from "validator";
import { NotFoundError, ValidationError, UnauthorizedError } from "../errors";

//gemaakt zodat lint niet klaagt over type any voor de functies
interface UserData {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  city: string;
  street: string;
  housenumber: string;
  zipcode: string;
  telephone: string;
}

//TODO / UPDATE
export const register = async (
  req: Request<unknown, unknown, UserData>,
  res: Response,
) => {
  const {
    email,
    password,
    firstname,
    lastname,
    city,
    street,
    housenumber,
    zipcode,
    telephone,
  } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    res.status(409).json({ message: "User already exists" });
    return;
  }
  const isStrongPassword = validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
  if (password.length > 25)
    throw new ValidationError(
      "password",
      "Password must be between 8 and 25 characters long.",
    );
  if (!isStrongPassword) {
    throw new ValidationError(
      "password",
      "Password must be between 8 and 25 characters long, and contain at least one lowercase letter, one uppercase letter, one number, and one special character.",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // kan het niet uitspreiden met ...req.body (lint doet moeilijk)
  const newUser = await User.create({
    email,
    firstname,
    lastname,
    city,
    street,
    housenumber,
    zipcode,
    telephone,
    password: hashedPassword,
  });

  if (!JWT_SECRET) {
    res.status(500).json({ message: "JWT_SECRET is not defined" });
    return;
  }

  const token = jwt.sign(
    { id: newUser._id, email: newUser.email },
    JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: NODE_ENV === "development",
    sameSite: "lax",
  });
  const userObj = {
    _id: newUser._id,
    email: newUser.email,
    firstname: newUser.firstname,
    lastname: newUser.lastname,
    city: newUser.city,
    street: newUser.street,
    housenumber: newUser.housenumber,
    zipcode: newUser.zipcode,
    telephone: newUser.telephone,
  };
  res.status(201).json({ status: "success", data: userObj });
};

export const login = async (
  req: Request<unknown, unknown, UserData>,
  res: Response,
) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError(
      "nope try again but with the correct credentials will ya?!",
    );
  }
  if (!JWT_SECRET) {
    res.status(500).json({ message: "JWT_SECRET is not defined" });
    return;
  }

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "1d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: NODE_ENV === "development",
    sameSite: "lax",
  });
  const userObj = {
    _id: user._id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    city: user.city,
    street: user.street,
    housenumber: user.housenumber,
    zipcode: user.zipcode,
    telephone: user.telephone,
  };
  res.status(200).json({ status: "success", data: userObj });
};

// werkt niet overload error nog te checkken
// export const logout = (req: Request, res: Response) => {
//   res.cookie("token", "", {
//     maxAge: 1,
//     httpOnly: true,
//     secure: NODE_ENV === "production" ? true : false,
//     sameSite: "lax",
//   });
//   return res
//     .status(200)
//     .json({ status: "success", message: "logged out successfully" });
// };

export const logout = (req: Request, res: Response) => {
  try {
    res.cookie("token", "", {
      maxAge: 1,
      httpOnly: true,
      secure: NODE_ENV === "development" ? true : false,
      sameSite: "lax",
    });
    res
      .status(200)
      .json({ status: "success", message: "Logged out successfully!" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
