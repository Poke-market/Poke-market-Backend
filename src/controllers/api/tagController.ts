import { Request } from "express";
import { Response } from "../../types/res.json";
import * as tagService from "../../services/tagService";
import { CreateTagSchema, UpdateTagSchema } from "../../services/tagService";

/**
 * @openapi
 * /tags:
 *   get:
 *     summary: Get all tags
 *     description: Retrieves a list of all available tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Successfully retrieved tags
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tag'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const getTags = async (req: Request, res: Response) => {
  const tags = await tagService.getTags();
  res.status(200).json({ status: "success", data: tags });
};

/**
 * @openapi
 * /tags:
 *   post:
 *     summary: Create a new tag
 *     description: Creates a new tag with the specified name
 *     tags: [Tags]
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
 *                 description: The name of the tag
 *     responses:
 *       201:
 *         description: Tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tag'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const addTag = async (req: Request, res: Response) => {
  const { name } = CreateTagSchema.parse(req.body);
  const tag = await tagService.addTag(name);
  res.status(201).json({ status: "success", data: tag });
};

/**
 * @openapi
 * /tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     description: Deletes a tag by its ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tag to delete
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tag'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const deleteTag = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tag = await tagService.deleteTag(id);
  res.status(200).json({ status: "success", data: tag });
};

/**
 * @openapi
 * /tags/{id}:
 *   patch:
 *     summary: Update a tag
 *     description: Updates a tag's name by its ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tag to update
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
 *                 description: The new name for the tag
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tag'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const updateTag = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = UpdateTagSchema.parse(req.body);
  const tag = await tagService.updateTag(id, name);
  res.status(200).json({ status: "success", data: tag });
};

/**
 * @openapi
 * /tags/name/{name}:
 *   get:
 *     summary: Get tag by name
 *     description: Retrieves a tag by its name
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the tag to retrieve
 *     responses:
 *       200:
 *         description: Tag retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tag'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const getTagByName = async (req: Request, res: Response) => {
  const { name } = req.params;
  const tag = await tagService.getTagByName(name);
  res.status(200).json({ status: "success", data: tag });
};

/**
 * @openapi
 * /tags/{id}:
 *   get:
 *     summary: Get tag by ID
 *     description: Retrieves a tag by its ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tag to retrieve
 *     responses:
 *       200:
 *         description: Tag retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tag'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const getTagById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tag = await tagService.getTagById(id);
  res.status(200).json({ status: "success", data: tag });
};
