import { Request, Response } from "express";
import { logoutUser, verifyUser } from "../../services/authService";
import { VerificationError } from "../../errors";
export const renderLoginView = (req: Request, res: Response) => {
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
    });
  } catch (error) {
    if (error instanceof VerificationError) {
      res.render("verification", {
        title: "Verification Failed",
        message: error.message,
      });
    }
    throw error;
  }
};
