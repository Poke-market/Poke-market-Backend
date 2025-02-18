import { Request, Response } from "express";
import { Error as MongooseError } from "mongoose";

import { Todo } from "../models/exampleModel";
const { ValidationError } = MongooseError;

export const getHelloWorld = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello World!" });
};

export const getTodos = async (req: , res: Response) => {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const addTodo = async (req: , res: Response) => {
  try {
    const { task } = req.body as { task: string };
    const todo = await Todo.create({ task });
    res.status(201).json(todo);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status().json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { , task } = req.body as Record<string, string>;
    const todo = await Todo.findByIdAndUpdate(
      id,
      { done, task },
      { new: true },
    );
    res.status(200).json(todo);
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
