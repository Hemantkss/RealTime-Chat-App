import User from "../models/userModel.js";
import Message from "../models/messageModel.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// get all users in sidebar
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get user's messages
export const getMessages = async (req, res) => {
  try {
    // Get user's chat ID from params
    const { id: userChatId } = req.params;
    // Get my ID from the request object
    const myId = req.user._id;

    // Get messages
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userChatId },
        { sender: userChatId, receiver: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// send a message to a user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // sending image to cloudinary
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // new message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    // soket io implementation for nitifications
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
