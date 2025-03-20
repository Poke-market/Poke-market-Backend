import { Request } from "express";
import { Response } from "../types/res.json";
import { Tag } from "../models/tagModel";

//get all tags
export const getTags = async (req: Request, res: Response) => {
  const tags = await Tag.find();
  res.status(200).json({ status: "success", data: tags });
};

//add tag
export const addTag = async (req: Request, res: Response) => {
  const { name } = req.body as Record<string, string>;
  const tag = await Tag.create({ name });
  res.status(201).json({ status: "success", data: tag });
};

//delete tag
export const deleteTag = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tag = await Tag.findByIdAndDelete(id);
  res.status(200).json({ status: "success", data: tag });
};

//update tag
export const updateTag = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body as Record<string, string>;
  const tag = await Tag.findByIdAndUpdate(id, { name }, { new: true });
  res.status(200).json({ status: "success", data: tag });
};

//get tag by name
export const getTagByName = async (req: Request, res: Response) => {
  const { name } = req.params;
  const tag = await Tag.findOne({ name });
  res.status(200).json({ status: "success", data: tag });
};

//get tag by id
export const getTagById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tag = await Tag.findById(id);
  res.status(200).json({ status: "success", data: tag });
};
