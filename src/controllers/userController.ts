import { Request, Response } from "express";
import { Error as MongooseError, Types } from "mongoose";

import { User } from "../models/userModel";

const { ValidationError } = MongooseError;

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ data: users, message: "success" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      res.status(402).json({ message: "Unauthorized" });
      return;
    }
    if (user._id !== id) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    const userdetails = await User.findById(id)
      .select("-password")
      .populate("wishlist");

    res.status(200).json({ data: userdetails, message: "success" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { itemId } = req.body as { itemId: Types.ObjectId };
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "forbidden" });
      return;
    }
    if (id !== user.id) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    user.wishList.push(itemId);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $addToSet: { wishList: itemId },
      },
      { new: true },
    )
      .select("-password")
      .populate("wishlist");
    res.status(200).json({ data: updatedUser, message: "success" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { itemId } = req.body as Record<string, string>;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "forbidden" });
      return;
    }
    if (id !== user.id) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    user.wishList.pull(itemId);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $pull: { wishList: itemId },
      },
      { new: true },
    )
      .select("-password")
      .populate("wishlist");
    res.status(200).json({ data: updatedUser, message: "success" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const {
      city,
      email,
      firstname,
      housenumber,
      lastname,
      password,
      street,
      telephone,
      zipcode,
    } = req.body as Record<string, string>;
    const user = await User.create({
      city,
      email,
      firstname,
      housenumber,
      lastname,
      password,
      street,
      telephone,
      zipcode,
    });
    res
      .status(201)
      .json({ data: user, message: `sucess, welcome ${firstname}` });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    res.status(200).json({ data: user, message: "success" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      req.body as Record<string, string>,
      { new: true },
    );
    res.status(200).json({ data: user, message: "success" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
