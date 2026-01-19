import "dotenv/config";
import express from "express";
import { ENV } from "./lib/env.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";

const app = express();
const __dirname = path.resolve();

// --- 1. CORS FIRST ---
app.use(cors({
    origin: ENV.CLIENT_URL,
    credentials: true
}));

// --- 2. INNGEST MUST BE BEFORE express.json() ---
// This allows Inngest to access the raw request body for signature verification
app.use(
    "/api/inngest",
    serve({
        client: inngest,
        functions,
    })
);

// --- 3. BODY PARSER (For all other routes) ---
app.use(express.json());

// --- 4. WEBHOOKS & ROUTES ---
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

app.get("/books", (req, res) => {
    res.status(200).json({ msg: "this is the books endpoint" });
});

if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
} 

// --- 5. START SERVER (ONLY ONCE) ---
const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT, () => {
            console.log("Server is running on port:", ENV.PORT);
        });
    } catch (error) {
        console.error("Something went wrong", error);
    }
}

startServer();