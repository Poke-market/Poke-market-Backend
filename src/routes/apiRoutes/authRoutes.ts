import express from "express";
import {
  register,
  login,
  logout,
  verify,
} from "../../controllers/apiControllers/AuthController";

const router = express.Router();

router
  .post("/register", register)
  .post("/login", login)
  .post("/logout", logout)
  .get("/verify/:token", verify);

export default router;
