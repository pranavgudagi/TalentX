import express from "express";
import { ENV } from "./lib/env.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";

const app = express();
const __dirname = path.resolve();

// --- 1. MIDDLEWARE ---
// Allow Vercel to handle CORS. The "*" helps debug "Network Error" issues.
app.use(cors({
    origin: ENV.CLIENT_URL || "*", 
    credentials: true,
}));

// --- 2. INNGEST ROUTE (Must come BEFORE express.json) ---
// Inngest needs to read the raw body signature.
app.use(
    "/api/inngest",
    serve({
        client: inngest,
        functions,
    })
);

// --- 3. PARSE JSON (For everything else) ---
app.use(express.json());

// --- 4. WEBHOOKS ---
app.post("/api/webhooks/clerk", async (req, res) => {
    try {
        const { type, data } = req.body;
        
        // Log to Vercel logs so you can debug
        console.log(`Received Webhook: ${type}`);

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

// --- 5. HEALTH CHECKS ---
app.get("/health", (req, res) => {
    res.status(200).json({ msg: "api is running correctly" });
});

// --- 6. START SERVER (FIXED) ---
// We only define this ONCE.
const startServer = async () => {
    try {
        await connectDB();
        
        // Only listen if we are running locally or if Vercel requires it explicitly
        const PORT = ENV.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });
    } catch (error) {
        console.error("Critical Failure:", error);
        process.exit(1);
    }
}

startServer();