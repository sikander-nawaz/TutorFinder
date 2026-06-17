import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter, authController.register);
router.post("/signup", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/logout", authenticate, authController.logout);
router.post("/refresh", authController.refresh);
router.get("/me", authenticate, authController.getMe);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);

router.post("/verify/email/send", authenticate, authController.sendEmailOtp);
router.post("/verify/email", authenticate, authController.verifyEmailOtp);
router.post("/verify/phone/send", authenticate, authController.sendPhoneOtp);
router.post("/verify/phone", authenticate, authController.verifyPhoneOtp);

export default router;
