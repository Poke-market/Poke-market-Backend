import { Request } from "express";
import { Response } from "../../types/res.json";
import * as slugService from "../../services/slugService";

/**
 * @openapi
 * /{slug}:
 *   get:
 *     summary: Get item by slug
 *     description: Retrieves an item using its URL-friendly slug identifier with fuzzy matching capabilities
 *     tags: [Slugs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly slug of the item
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
 *                       type: object
 *                       properties:
 *                         item:
 *                           $ref: '#/components/schemas/Item'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const getItemBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  const item = await slugService.getItemBySlug(slug);

  res.status(200).json({
    status: "success",
    data: { item },
  });
};
