import express from "express";
import {
  forgotPassword,
  getMe,
  loginUser,
  logOut,
  logoutAll,
  registerUser,
  resendToken,
  resetPassword,
  verifyToken,
} from "../controllers/user.controller.js";
import authMiddleWare from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/resend", resendToken);
router.get("/verify/:verificationToken", verifyToken);
router.post("/login", loginUser);
router.get("/me", authMiddleWare, getMe);
router.delete("/logout", authMiddleWare, logOut);
router.delete("/logout-all", authMiddleWare, logoutAll);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:verificationToken", resetPassword);

export default router;
