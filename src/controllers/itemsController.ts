import { Request } from "express";
import { Response } from "../types/res.json";

import { makePageLinkBuilder } from "../utils/pageLinkBuilder";
import * as itemService from "../services/itemService";
const { CreateItemSchema, UpdateItemSchema, GetItemByNameSchema } = itemService;

export const getItems = async (req: Request, res: Response) => {
  const getPageLink = makePageLinkBuilder(req);
  const result = await itemService.getItems(req.query, getPageLink);

  res.status(200).json({
    status: "success",
    data: result,
  });
};

export const getItemById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await itemService.getItemById(id);

  res.status(201).json({
    status: "success",
    data: result,
  });
};

export const addItem = async (req: Request, res: Response) => {
  const itemData = CreateItemSchema.parse(req.body);
  const result = await itemService.addItem(itemData);

  res.status(201).json({
    status: "success",
    data: result,
  });
};

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

export const deleteItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await itemService.deleteItem(id);

  // Return a properly formatted JSON response
  res.status(200).json({
    status: "success",
    data: result.data,
  });
};

export const getItemByName = async (req: Request, res: Response) => {
  const { name } = GetItemByNameSchema.parse(req.body);
  const result = await itemService.getItemByName(name);

  res.status(200).json({
    status: "success",
    data: result,
  });
};
