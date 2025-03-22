import { type FilterQuery, type SortOrder } from "mongoose";
import mongoose from "mongoose";
import { z } from "zod";
import { NotFoundError, ValidationError } from "../errors";
import { User } from "../models/userModel";
import { RawQuery } from "../types/query";
import { generatePaginationInfo } from "../utils/paginationHelper";
import { registerSchema } from "./authService";
import bcrypt from "bcrypt";

// Define input schemas
export const PaginationParamsSchema = z.object({
  limit: z.coerce.number().min(1).default(10),
  page: z.coerce.number().min(1).default(1),
});

export const FilterParamsSchema = z.object({
  search: z.string().trim().optional(),
  isAdmin: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
});

export const SortParamsSchema = z.object({
  sort: z.enum(["email", "firstname", "lastname", "createdAt"]).optional(),
  order: z
    .union([
      z.enum(["asc", "desc", "ascending", "descending"]),
      z.literal(1),
      z.literal(-1),
    ])
    .default("asc"),
});

// Infer types from schemas
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type FilterParams = z.infer<typeof FilterParamsSchema>;
export type SortParams = z.infer<typeof SortParamsSchema>;

export function buildUsersFilter(params: FilterParams) {
  const { search, isAdmin, emailVerified } = FilterParamsSchema.parse(params);
  const filter: FilterQuery<typeof User> = {};

  // Handle search parameter
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: "i" } },
      { firstname: { $regex: search, $options: "i" } },
      { lastname: { $regex: search, $options: "i" } },
    ];
  }

  // Handle admin filter
  if (isAdmin !== undefined) {
    filter.isAdmin = isAdmin;
  }

  // Handle emailVerified filter
  if (emailVerified !== undefined) {
    filter.emailVerified = emailVerified;
  }

  return filter;
}

export function buildUsersSorter(
  params: RawQuery<SortParams>,
): Record<string, SortOrder> {
  const { sort, order } = SortParamsSchema.parse(params);
  const mongoSorter: Record<string, SortOrder> = {};

  // Convert string order to numeric if needed
  const sortOrder =
    order === "asc" || order === "ascending" || order === 1 ? 1 : -1;

  // Set sort field
  if (sort) {
    mongoSorter[sort] = sortOrder;
  } else {
    // Default sort by email if not specified
    mongoSorter.email = sortOrder;
  }

  return mongoSorter;
}

export async function getUsers(
  params: RawQuery<PaginationParams & FilterParams & SortParams>,
  getPageLink: (page: number) => string,
) {
  const filter = buildUsersFilter(params);
  const sorter = buildUsersSorter(params);
  const { limit, page } = PaginationParamsSchema.parse(params);

  const userCount = await User.countDocuments(filter);
  const skip = (page - 1) * limit;

  if (page > 1 && skip >= userCount) throw new NotFoundError("Page not found");

  const users =
    userCount > 0
      ? await User.find(filter)
          .select("-password -verificationToken -resetToken")
          .collation({ locale: "en" })
          .limit(limit)
          .skip(skip)
          .sort(sorter)
      : [];

  const paginationInfo = generatePaginationInfo(
    userCount,
    page,
    limit,
    getPageLink,
  );

  return {
    info: paginationInfo,
    users: users,
  };
}

export async function getUserById(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ValidationError(
      "id",
      "User id is not valid id by Mongoose standards",
    );
  }

  const user = await User.findById(id)
    .select("-password -verificationToken -resetToken")
    .populate("wishList", "name _id");

  if (!user) throw new NotFoundError("User not found");

  return user;
}

export async function deleteUser(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ValidationError(
      "id",
      "User id is not valid id by Mongoose standards",
    );
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) throw new NotFoundError("User not found");

  return user;
}

// Full user schema for PUT requests (requires all fields)
export const UserFullSchema = registerSchema.extend({
  isAdmin: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
});

// User update schema for validation
export const UserUpdateSchema = UserFullSchema.partial();

export type UserFullData = z.infer<typeof UserFullSchema>;
export type UserUpdateData = z.infer<typeof UserUpdateSchema>;

export async function updateUser(id: string, userUpdateData: UserUpdateData) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ValidationError(
      "id",
      "User ID is not valid by Mongoose standards",
    );
  }

  // Find user first to check if exists
  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  // If email is being changed, check if the new email already exists for another user
  if (userUpdateData.email && userUpdateData.email !== existingUser.email) {
    const emailExists = await User.findOne({
      email: userUpdateData.email,
      _id: { $ne: id }, // Exclude the current user
    });

    if (emailExists) {
      throw new ValidationError(
        "email",
        "Email is already in use by another account",
      );
    }
  }

  // if password is being updated, hash it
  if (userUpdateData.password) {
    userUpdateData.password = await bcrypt.hash(userUpdateData.password, 10);
  }

  // Update user with validated data
  const updatedUser = await User.findByIdAndUpdate(id, userUpdateData, {
    new: true,
  }).select("-password -verificationToken -resetToken");

  if (!updatedUser) {
    throw new NotFoundError("User not found");
  }

  return updatedUser;
}
