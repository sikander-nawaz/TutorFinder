import { Router } from "express";
import { earningsController } from "../controllers/earningsController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/tutor/earnings", earningsController.getTutorEarnings);

export default router;
