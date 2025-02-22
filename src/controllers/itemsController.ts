import { Request, Response } from "express";
// import { Error as MongooseError } from "mongoose";

import { Item } from "../models/itemModel";

// const { ValidationError } = MongooseError;

export const getItems = async (req: Request, res: Response) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

// export const addTodo = async (req: Request, res: Response) => {
//   try {
//     const { task } = req.body as Record<string, string>;
//     const todo = await Todo.create({ task });
//     res.status(201).json(todo);
//   } catch (error: unknown) {
//     if (error instanceof ValidationError) {
//       res.status(400).json({ message: error.message });
//     } else if (error instanceof Error) {
//       res.status(500).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Something went wrong" });
//     }
//   }
// };

// export const updateTodo = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { done, task } = req.body as Record<string, string>;
//     const todo = await Todo.findByIdAndUpdate(
//       id,
//       { done, task },
//       { new: true },
//     );
//     res.status(200).json(todo);
//   } catch (error: unknown) {
//     if (error instanceof ValidationError) {
//       res.status(400).json({ message: error.message });
//     } else if (error instanceof Error) {
//       res.status(500).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Something went wrong" });
//     }
//   }
// };
