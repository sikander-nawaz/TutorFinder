import { Router } from "express";
import { chatController } from "../controllers/chatController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/chats", chatController.getMyChats);
router.get("/chats/:chatId/messages", chatController.getMessages);
router.post("/chats/:chatId/messages", chatController.sendMessage);
router.patch("/chats/:chatId/seen", chatController.markSeen);

export default router;
