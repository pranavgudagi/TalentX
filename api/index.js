import express from "express";
import { ENV } from "../backend/src/lib/env.js";
import { connectDB } from "../backend/src/lib/db.js";
import cors from "cors";
import { serve } from "inngest/express";
import { inngest, functions } from "../backend/src/lib/inngest.js";

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  })
);

// Inngest handler
app.use("/inngest", serve({ client: inngest, functions }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is running correctly" });
});

// Books endpoint
app.get("/books", (req, res) => {
  res.status(200).json({ msg: "this is the books endpoint" });
});

// Connect to DB and serve
connectDB().catch((err) => {
  console.error("Database connection error:", err);
});

export default app;
