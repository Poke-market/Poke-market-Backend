import type { Request } from "express";

export const makePageLinkBuilder = (req: Request) => (page: number) => {
  const baseUrl = `${req.protocol}://${req.get("host")}${
    req.originalUrl.split("?")[0]
  }`;
  const queryParams = { ...req.query, page: page.toString() };
  return `${baseUrl}?${new URLSearchParams(queryParams).toString()}`;
};
