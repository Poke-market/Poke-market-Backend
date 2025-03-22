import { Request } from "express";
import { Response } from "../types/res.json";
import { Types } from "mongoose";
import mongoose from "mongoose";

import { ForbiddenError, NotFoundError, ValidationError } from "../errors";
import { User } from "../models/userModel";
import { Item } from "../models/itemModel";
import {
  getUserById,
  getUsers,
  deleteUser as deleteUserService,
  updateUser as updateUserService,
  UserUpdateSchema,
  UserFullSchema,
  addUser as addUserService,
  UserCreateSchema,
} from "../services/userService";
import { makePageLinkBuilder } from "../utils/pageLinkBuilder";

export const getAllUsers = async (req: Request, res: Response) => {
  const { users, info } = await getUsers(req.query, makePageLinkBuilder(req));
  res.status(200).json({ status: "success", data: { info, users } });
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await getUserById(id);
  res.status(200).json({ status: "success", data: user });
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
  const userData = UserCreateSchema.parse(req.body);
  const newUser = await addUserService(userData);
  res.status(201).json({ status: "success", data: newUser });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await deleteUserService(id);
  res.status(200).json({ status: "success", data: user });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userUpdateData = UserUpdateSchema.parse(req.body);
  const updatedUser = await updateUserService(id, userUpdateData);

  res.status(200).json({ status: "success", data: updatedUser });
};

export const replaceUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  // compared to updateUser, this will throw an error if any field is missing
  const userFullData = UserFullSchema.parse(req.body);
  const replacedUser = await updateUserService(id, userFullData);

  res.status(200).json({ status: "success", data: replacedUser });
};
