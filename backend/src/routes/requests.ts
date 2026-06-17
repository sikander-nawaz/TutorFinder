import { Router } from "express";
import { requestController } from "../controllers/requestController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/requests/student", requestController.getStudentRequests);
router.get("/requests/tutor", requestController.getTutorRequests);
router.get("/admin/requests", requestController.getAllRequests);
router.post("/requests", requestController.createRequest);
router.patch("/requests/:id", requestController.updateRequest);
router.patch("/requests/:id/status", requestController.updateRequestStatus);
router.delete("/requests/:id", requestController.deleteRequest);

export default router;
