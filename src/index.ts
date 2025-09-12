import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import passport from "passport";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import userRoutes from "./routes/userRoutes";
import "./config/passport";
import { startNotificationJob } from "./utils/notification";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use((req, _, next) => {
  req.app.set("io", io);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/user", userRoutes);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("message", (data) => {
    console.log("Message received:", data);
    io.emit("message", data);
  });

  socket.on("requestForNotification", async (userId) => {
    socket.data.userId = userId;
    console.log("Notification request registered for:", userId);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

startNotificationJob(io);

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.log("MONGODB_URI not found in environment variables");
      return;
    }

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.log("Server will continue without database");
  }
};

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server started running`);
  });
};

startServer();
