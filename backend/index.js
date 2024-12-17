import express from "express";
import authRoutes from "./routes/authRoute.js";
import messageRoute from "./routes/messageRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/connectDB.js";
import dotenv from "dotenv";

import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // allow only requests from this origin
    credentials: true, // allow cookies
    //methods: ["GET", "POST", "PUT", "DELETE"] // allow these HTTP methods in requests
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoute);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
