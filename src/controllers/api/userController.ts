import { Request } from "express";
import { Response } from "../../types/res.json";
import { Types } from "mongoose";
import mongoose from "mongoose";

import { ForbiddenError, NotFoundError, ValidationError } from "../../errors";
import { User } from "../../models/userModel";
import { Item } from "../../models/itemModel";

import { makePageLinkBuilder } from "../../utils/pageLinkBuilder";
import * as userService from "../../services/userService";
const { UserCreateSchema, UserUpdateSchema, UserFullSchema } = userService;

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a paginated list of users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter users by email, firstname, or lastname
 *       - in: query
 *         name: isAdmin
 *         schema:
 *           type: boolean
 *         description: Filter by admin status
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         info:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               description: Total number of users
 *                             pages:
 *                               type: integer
 *                               description: Total number of pages
 *                             page:
 *                               type: integer
 *                               description: Current page
 *                             prev:
 *                               type: string
 *                               nullable: true
 *                               description: URL for the previous page
 *                             next:
 *                               type: string
 *                               nullable: true
 *                               description: URL for the next page
 *                         users:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const getAllUsers = async (req: Request, res: Response) => {
  const { users, info } = await userService.getUsers(
    req.query,
    makePageLinkBuilder(req),
  );
  res.status(200).json({ status: "success", data: { info, users } });
};

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieves a user by their ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  res.status(200).json({ status: "success", data: user });
};

/**
 * @openapi
 * /users/{id}/wishlist:
 *   post:
 *     summary: Add item to wishlist
 *     description: Adds an item to the user's wishlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose wishlist to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: The ID of the item to add to the wishlist
 *     responses:
 *       200:
 *         description: Item added to wishlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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

/**
 * @openapi
 * /users/{id}/wishlist:
 *   delete:
 *     summary: Remove item from wishlist
 *     description: Removes an item from the user's wishlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose wishlist to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: The ID of the item to remove from the wishlist
 *     responses:
 *       200:
 *         description: Item removed from wishlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with the provided information
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstname
 *               - lastname
 *               - city
 *               - street
 *               - housenumber
 *               - zipcode
 *               - telephone
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min 8 chars with uppercase, lowercase, digit, special char)
 *               firstname:
 *                 type: string
 *                 description: User's first name
 *               lastname:
 *                 type: string
 *                 description: User's last name
 *               city:
 *                 type: string
 *                 description: User's city
 *               street:
 *                 type: string
 *                 description: User's street
 *               housenumber:
 *                 type: string
 *                 description: User's house number
 *               zipcode:
 *                 type: string
 *                 description: User's zip code
 *               telephone:
 *                 type: string
 *                 description: User's telephone number
 *               isAdmin:
 *                 type: boolean
 *                 description: Whether the user is an admin
 *               isVerified:
 *                 type: boolean
 *                 description: Whether the user is verified
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const addUser = async (req: Request, res: Response) => {
  const userData = UserCreateSchema.parse(req.body);
  const newUser = await userService.addUser(userData);
  res.status(201).json({ status: "success", data: newUser });
};

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by their ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.deleteUser(id);
  res.status(200).json({ status: "success", data: user });
};

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Update a user
 *     description: Partially updates a user's information (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               city:
 *                 type: string
 *               street:
 *                 type: string
 *               housenumber:
 *                 type: string
 *               zipcode:
 *                 type: string
 *               telephone:
 *                 type: string
 *               avatar:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *               isVerified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userUpdateData = UserUpdateSchema.parse(req.body);
  const updatedUser = await userService.updateUser(id, userUpdateData);

  res.status(200).json({ status: "success", data: updatedUser });
};

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Replace a user
 *     description: Completely replaces a user's information (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to replace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User replaced successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const replaceUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  // compared to updateUser, this will throw an error if any field is missing
  const userFullData = UserFullSchema.parse(req.body);
  const replacedUser = await userService.updateUser(id, userFullData);

  res.status(200).json({ status: "success", data: replacedUser });
};
