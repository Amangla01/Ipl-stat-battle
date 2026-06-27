import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes/api";
import { registerSocketHandlers } from "./socket/socketHandler";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(httpServer, {
  cors: {
    origin: [CLIENT_URL, "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors({ origin: [CLIENT_URL, "http://localhost:5173"], credentials: true }));
app.use(express.json());
app.use("/api", apiRouter);

io.on("connection", (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);
  registerSocketHandlers(io, socket);
});

async function start() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/ipl-stat-battle";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const PORT = parseInt(process.env.PORT || "3001");
    httpServer.listen(PORT, () => {
      console.log(`🚀 IPL Stat Battle server running on http://localhost:${PORT}`);
      console.log(`🌐 Accepting connections from ${CLIENT_URL}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
}

start();
