import { Request, Response } from "express";
import { logoutUser, verifyUser } from "../../services/authService";
import { VerificationError } from "../../errors";
import * as authService from "../../services/authService";
export const renderLoginView = async (req: Request, res: Response) => {
  // If user is already logged in, redirect to home page
  const [isAuthenticated] = await authService.verifyToken(req);

  if (isAuthenticated) {
    res.redirect("/");
    return;
  }

  res.render("login", { title: "Login" });
};

export const renderRegisterView = (req: Request, res: Response) => {
  res.render("register", { title: "Register" });
};

export const renderLogoutView = (req: Request, res: Response) => {
  logoutUser(res);
  res.redirect("/auth/login");
};

export const renderVerifyView = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    await verifyUser(token);
    res.render("verification", {
      title: "Verification Successful!",
      message: "Congratulations! Your account has been verified.!",
      success: true,
    });
  } catch (error) {
    if (error instanceof VerificationError) {
      res.render("verification", {
        title: "Verification Failed",
        message: error.message,
        success: false,
      });
    }
  }
};
