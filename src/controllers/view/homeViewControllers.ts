import { Request, Response } from "express";
import {
  FRONTEND_LIVE_URL,
  FRONTEND_DEV_URL,
  BACKEND_REPO_URL,
  FRONTEND_REPO_URL,
} from "../../config/env";

export const renderHomeView = (req: Request, res: Response) => {
  res.render("home", {
    user: req.user,
    title: "Admin Dashboard",
    frontendLiveUrl: FRONTEND_LIVE_URL,
    frontendDevUrl: FRONTEND_DEV_URL,
    backendRepoUrl: BACKEND_REPO_URL,
    frontendRepoUrl: FRONTEND_REPO_URL,
  });
};
