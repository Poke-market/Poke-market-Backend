import { Request } from "express";
import { Response } from "../types/res.json";
import * as tagService from "../services/tagService";
import { CreateTagSchema, UpdateTagSchema } from "../services/tagService";

//get all tags
export const getTags = async (req: Request, res: Response) => {
  const tags = await tagService.getTags();
  res.status(200).json({ status: "success", data: tags });
};

//add tag
export const addTag = async (req: Request, res: Response) => {
  const { name } = CreateTagSchema.parse(req.body);
  const tag = await tagService.addTag(name);
  res.status(201).json({ status: "success", data: tag });
};

//delete tag
export const deleteTag = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tag = await tagService.deleteTag(id);
  res.status(200).json({ status: "success", data: tag });
};

//update tag
export const updateTag = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = UpdateTagSchema.parse(req.body);
  const tag = await tagService.updateTag(id, name);
  res.status(200).json({ status: "success", data: tag });
};

//get tag by name
export const getTagByName = async (req: Request, res: Response) => {
  const { name } = req.params;
  const tag = await tagService.getTagByName(name);
  res.status(200).json({ status: "success", data: tag });
};

//get tag by id
export const getTagById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tag = await tagService.getTagById(id);
  res.status(200).json({ status: "success", data: tag });
};
