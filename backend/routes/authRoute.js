import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import {
  checkAuth,
  logIn,
  logOut,
  signUp,
  updateProfile,
} from "../controllers/authController.js";

// Auth routes
const router = express.Router();

router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/logout", logOut);

// Profile routes
router.put("/update-profile", protectRoute, updateProfile);

// check authentication for new users
router.get("/check", protectRoute, checkAuth);

export default router;
