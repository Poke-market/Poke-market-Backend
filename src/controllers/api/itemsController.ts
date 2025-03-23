import { Request } from "express";
import { Response } from "../../types/res.json";

import { makePageLinkBuilder } from "../../utils/pageLinkBuilder";
import * as itemService from "../../services/itemService";
const { CreateItemSchema, UpdateItemSchema, GetItemByNameSchema } = itemService;

/**
 * @openapi
 * /items:
 *   get:
 *     summary: Get all items
 *     description: Returns a paginated list of items with optional filtering
 *     tags: [Items]
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
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter items by name, description, category or tag
 *       - in: query
 *         name: cat
 *         schema:
 *           type: string
 *         description: Comma-separated list of categories to filter by (e.g., "medicine,berries,food")
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to filter by (e.g., "healing,in-battle,holdable")
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Maximum price filter
 *       - in: query
 *         name: minDiscountedPrice
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum discounted price filter
 *       - in: query
 *         name: maxDiscountedPrice
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Maximum discounted price filter
 *     responses:
 *       200:
 *         description: Successfully retrieved items
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
 *                               description: Total number of items
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
 *                             first:
 *                               type: string
 *                               description: URL for the first page
 *                             last:
 *                               type: string
 *                               description: URL for the last page
 *                             categorieCount:
 *                               type: object
 *                               description: Count of items in each category. All categories are always included, regardless of whether they have items in the current result set.
 *                               properties:
 *                                 medicine:
 *                                   type: integer
 *                                   example: 5
 *                                 berries:
 *                                   type: integer
 *                                   example: 5
 *                                 food:
 *                                   type: integer
 *                                   example: 5
 *                                 pokéballs:
 *                                   type: integer
 *                                   example: 5
 *                                 evolution:
 *                                   type: integer
 *                                   example: 5
 *                                 vitamins:
 *                                   type: integer
 *                                   example: 5
 *                                 "tm/hm":
 *                                   type: integer
 *                                   example: 5
 *                                 "mega stones":
 *                                   type: integer
 *                                   example: 5
 *                             priceRange:
 *                               type: object
 *                               properties:
 *                                 min:
 *                                   type: integer
 *                                   description: Minimum price
 *                                 max:
 *                                   type: integer
 *                                   description: Maximum price
 *                         items:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Item'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const getItems = async (req: Request, res: Response) => {
  const getPageLink = makePageLinkBuilder(req);
  const result = await itemService.getItems(req.query, getPageLink);

  res.status(200).json({
    status: "success",
    data: result,
  });
};

/**
 * @openapi
 * /items/{id}:
 *   get:
 *     summary: Get an item by ID
 *     description: Returns a single item by its ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       201:
 *         description: Successfully retrieved item
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Item'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const getItemById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await itemService.getItemById(id);

  res.status(201).json({
    status: "success",
    data: result,
  });
};

/**
 * @openapi
 * /items:
 *   post:
 *     summary: Create a new item
 *     description: Creates a new item in the database
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *               - photoUrl
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               photoUrl:
 *                 type: string
 *               category:
 *                 $ref: '#/components/schemas/Category'
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isNewItem:
 *                 type: boolean
 *               discount:
 *                 $ref: '#/components/schemas/Discount'
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Item'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const addItem = async (req: Request, res: Response) => {
  const itemData = CreateItemSchema.parse(req.body);
  const result = await itemService.addItem(itemData);

  res.status(201).json({
    status: "success",
    data: result,
  });
};

/**
 * @openapi
 * /items/{id}:
 *   patch:
 *     summary: Update an item
 *     description: Updates an existing item by its ID
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               photoUrl:
 *                 type: string
 *               category:
 *                 $ref: '#/components/schemas/Category'
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isNewItem:
 *                 type: boolean
 *               discount:
 *                 $ref: '#/components/schemas/Discount'
 *     responses:
 *       201:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Item'
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
export const updateItem = async (req: Request, res: Response) => {
  // Item needs to be updated by the new data even though not everything was changed or given as data so more like a patch
  const { id } = req.params;
  const itemData = UpdateItemSchema.parse(req.body);
  const result = await itemService.updateItem(id, itemData);

  res.status(201).json({
    status: "success",
    data: result,
  });
};

/**
 * @openapi
 * /items/{id}:
 *   delete:
 *     summary: Delete an item
 *     description: Deletes an item by its ID
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const deleteItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await itemService.deleteItem(id);

  // Return a properly formatted JSON response
  res.status(200).json({
    status: "success",
    data: result.data,
  });
};

/**
 * @openapi
 * /items/name:
 *   get:
 *     summary: Get an item by name
 *     description: Returns a single item by its name
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Item name to search for
 *     responses:
 *       200:
 *         description: Successfully retrieved item
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Item'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const getItemByName = async (req: Request, res: Response) => {
  const { name } = GetItemByNameSchema.parse(req.body);
  const result = await itemService.getItemByName(name);

  res.status(200).json({
    status: "success",
    data: result,
  });
};
