import { Request } from "express";
import { Response } from "../../types/res.json";
import * as slugService from "../../services/slugService";

export const getItemBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  const item = await slugService.getItemBySlug(slug);

  res.status(200).json({
    status: "success",
    data: { item },
  });
};
