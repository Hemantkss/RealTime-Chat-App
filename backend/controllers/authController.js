import cloudinary from "../lib/cloudinary.js";
import { genarateToken } from "../lib/utils.js";
import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";

// Sigup Controller
export const signUp = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    // Validate input fields
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    // salt for password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    // Create a new user
    const newUser = new User({ email, password: hashedPassword, fullName });
    if (newUser) {
      // genarate jwt token
      genarateToken(newUser._id, res);
      await newUser.save(); // save new user
      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        message: "User created successfully",
      });
    } else {
      return res.status(400).json({ message: "Failed to create user" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login Controller
export const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // password check
    const isPaawordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPaawordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    // genarateToken
    genarateToken(user._id, res);
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Logout Controller
export const logOut = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Profile controller with cloudinary service
export const updateProfile = async (req, res) => {
  try {
    // update user's profile picture using cloudinary service
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }
    // Upload profile picture to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    // send request
    return res.status(200).json({
      updatedUser,
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    console.log("Error in update-profile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// check authentication for user
export const checkAuth = (req, res) => {
  try {
    // check if user is authenticated
    res.status(200).json(req.user);
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
