import { Router } from "express";
import { profileController } from "../controllers/profileController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import {
  uploadAvatar,
  uploadDocument,
} from "../middleware/uploadMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);
router.patch("/", profileController.updateProfile);

router.post("/avatar", uploadAvatar, profileController.uploadAvatar);

router.post(
  "/documents",
  authorize("tutor", "student"),
  uploadDocument,
  profileController.uploadDocument,
);

router.get(
  "/verification-status",
  authorize("tutor"),
  profileController.getVerificationStatus,
);
router.post(
  "/submit-verification",
  authorize("tutor"),
  profileController.submitVerification,
);

router.get(
  "/student-verification-status",
  authorize("student"),
  profileController.getStudentVerificationStatus,
);
router.post(
  "/submit-student-verification",
  authorize("student"),
  profileController.submitStudentVerification,
);

export default router;
