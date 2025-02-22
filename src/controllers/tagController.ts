import { Request, Response } from "express";
import { Error as MongooseError } from "mongoose";

import { Tag } from "../models/tagModel";

const { ValidationError } = MongooseError;

//get all tags
export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await Tag.find();
    res.status(200).json(tags);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

//add tag
export const addTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.body as Record<string, string>;
    const tag = await Tag.create({ name });
    res.status(201).json(tag);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

//delete tag
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tag = await Tag.findByIdAndDelete(id);
    res.status(200).json(tag);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

//update tag
export const updateTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body as Record<string, string>;
    const tag = await Tag.findByIdAndUpdate(id, { name }, { new: true });
    res.status(200).json(tag);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

//get tag by name
export const getTagByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const tag = await Tag.findOne({ name });
    res.status(200).json(tag);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

//get tag by id
export const getTagById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tag = await Tag.findById(id);
    res.status(200).json(tag);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
