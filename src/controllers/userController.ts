import { Request } from "express";
import { Response } from "../types/res.json";
import { Types } from "mongoose";
import mongoose from "mongoose";

import { ForbiddenError, NotFoundError, ValidationError } from "../errors";
import { User } from "../models/userModel";
import { Item } from "../models/itemModel";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await User.find()
    .select("-password")
    //only show name, id from wishlist
    .populate("wishList", "name _id");
  res.status(200).json({ status: "success", data: users });
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  //TODO to be changed to logged-in user
  // const user = req.user;

  if (!mongoose.isValidObjectId(id))
    throw new ValidationError(
      "id",
      "Item id is not valid id by Mongoose standards",
    );
  //TODO to be changed to logged-in user
  // if (!user) {
  //   throw new NotFoundError("User not found");
  // }
  // if (user._id.toString() !== id) {
  //   throw new BadRequestError("Unauthorized acess");
  // }
  const userdetails = await User.findById(id)
    .select("-password")
    .populate("wishList", "name _id");

  res.status(200).json({ status: "success", data: userdetails });
};

export const addToWishlist = async (req: Request, res: Response) => {
  //in json body zet je "itemId"
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    throw new ValidationError(
      "id",
      "Item id is not valid id by Mongoose standards",
    );
  const { itemId } = req.body as { itemId: Types.ObjectId };
  const user = await User.findById(id).populate("wishList", "name _id");
  if (!user) throw new NotFoundError("user not found");
  // TODO to be changed to logged-in user
  // TODO to be changed to logged-in user
  if (id !== user.id)
    throw new ForbiddenError("Logged in user ID does not match user ID");

  const itemExists = await Item.countDocuments({ _id: itemId });
  if (!itemExists) throw new NotFoundError("Item not found");

  user.wishList.push(itemId);
  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      $addToSet: { wishList: itemId },
    },
    { new: true },
  )
    .select("-password")
    .populate("wishList");
  res.status(200).json({ status: "success", data: updatedUser });
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  //in json body zet je "itemId"
  const { id } = req.params;
  const { itemId } = req.body as Record<string, string>;
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  if (id !== user.id) {
    throw new ForbiddenError("Logged in user ID does not match user ID");
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
    .populate("wishList");
  res.status(200).json({ status: "success", data: updatedUser });
};

export const addUser = async (req: Request, res: Response) => {
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
  res.status(201).json({ status: "success", data: user });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  res.status(200).json({ status: "success", data: user });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(
    id,
    req.body as Record<string, string>,
    { new: true },
  );
  res.status(200).json({ status: "success", data: user });
};
