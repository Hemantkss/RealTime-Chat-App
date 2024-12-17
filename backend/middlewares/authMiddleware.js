import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Check if the user has a valid JWT token in their cookies
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // Verify the JWT token and retrieve the user's ID from it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // Find the user in the database by their ID
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the user to the request object for use in other routes
    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute authMiddleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};