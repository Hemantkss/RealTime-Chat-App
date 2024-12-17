import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/messageController.js";

// message routes
const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

export default router;
