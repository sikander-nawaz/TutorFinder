import { Router } from "express";
import { reviewController } from "../controllers/reviewController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

// Public - anyone can read tutor reviews
router.get("/tutors/:tutorId/reviews", reviewController.getTutorReviews);

// Protected - only authenticated students can create
router.post("/reviews", authenticate, reviewController.createReview);

export default router;
