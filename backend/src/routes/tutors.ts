import { Router } from "express";
import { tutorSearchController } from "../controllers/tutorSearchController.js";

const router = Router();

// Public routes - no auth required for browsing tutors
router.get("/tutors", tutorSearchController.searchTutors);
router.get("/tutors/:id", tutorSearchController.getTutorById);

export default router;
