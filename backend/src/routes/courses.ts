import { Router } from "express";
import { courseController } from "../controllers/courseController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/tutor/courses", courseController.getMyCourses);
router.post("/tutor/courses", courseController.createCourse);
router.patch("/tutor/courses/:id", courseController.updateCourse);
router.delete("/tutor/courses/:id", courseController.deleteCourse);

export default router;
