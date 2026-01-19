import express from "express";
import { ENV } from "./lib/env.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";

const app = express();
const __dirname = path.resolve();

// --- 1. CONFIGURATION ---
// Allow Vercel to handle CORS, or use this restrictive set
app.use(cors({
    origin: ENV.CLIENT_URL || "*", // Fallback to * to prevent CORS errors during test
    credentials: true,
}));

// --- 2. INNGEST (Must be BEFORE express.json) ---
// Inngest needs the raw body to verify the signature
app.use(
    "/api/inngest",
    serve({
        client: inngest,
        functions,
    })
);

// --- 3. STANDARD MIDDLEWARE ---
app.use(express.json());

// --- 4. ROUTES ---
app.post("/api/webhooks/clerk", async (req, res) => {
    try {
        const { type, data } = req.body;
        if (type === "user.created") {
            await inngest.send({ name: "clerk/user.created", data });
        }
        if (type === "user.deleted") {
             await inngest.send({ name: "clerk/user.deleted", data });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).json({ error: "Webhook failed" });
    }
});

app.get("/health", (req, res) => {
    res.status(200).json({ msg: "api is running correctly" });
});

// --- 5. STARTUP (Only start ONCE) ---
const startServer = async () => {
    try {
        await connectDB();
        
        // Only listen if we are NOT in Vercel (Vercel handles listening automatically)
        // But for standard deployment, we leave this. 
        // Just ensure it's the ONLY listen call.
        app.listen(ENV.PORT || 3000, () => {
            console.log("Server is running on port:", ENV.PORT || 3000);
        });
    } catch (error) {
        console.error("Critical Failure:", error);
        process.exit(1);
    }
}

startServer();