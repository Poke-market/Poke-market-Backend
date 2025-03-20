import express from "express";
import {
  register,
  login,
  logout,
  verificationEmail,
} from "../controllers/AuthController";

const router = express.Router();

router
  .post("/register", register)
  .post("/login", login)
  .post("/logout", logout)
  .get("/verify", verificationEmail as express.RequestHandler);

export default router;
