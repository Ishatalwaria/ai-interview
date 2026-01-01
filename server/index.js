
console.log(">>> Starting server...");

import fs from 'fs';
import path from 'path';

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import admin from "firebase-admin";
import multer from "multer";

dotenv.config();


const app = express();
const upload = multer({ dest: "uploads/" });


app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
connectDB()
    .then(() => console.log("Database connected successfully"))
    .catch((error) => console.error("Database connection failed:", error));
    
// Initializing Firebase Admin SDK (guarded)
try {
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!svc) {
    console.warn("⚠️  FIREBASE_SERVICE_ACCOUNT not set. Auth-required routes will be unavailable.");
  } else {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(svc);
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON. Ensure it is a valid JSON string.");
      throw e;
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized");
  }
} catch (e) {
  console.error("Firebase Admin initialization error:", e?.message || e);
}

// Routing
import authRoutes from "./routes/authRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import userRoutes from "./routes/userRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/user", userRoutes);

// Starting the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
