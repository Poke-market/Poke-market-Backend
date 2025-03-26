import express from "express";
import {
  register,
  login,
  logout,
  verify,
} from "../../controllers/api/AuthController";
import upload from "../../middleware/uploadMiddleware";

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication operations
 */

const router = express.Router();

router
  .post("/register", upload.single("avatar"), register)
  .post("/login", login)
  .post("/logout", logout)
  .get("/verify/:token", verify);

export default router;
