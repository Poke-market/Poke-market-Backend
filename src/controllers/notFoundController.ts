import { Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    endpoint: req.originalUrl,
    message: `The requested endpoint doesn't exist.`,
    method: req.method,
  });
};
