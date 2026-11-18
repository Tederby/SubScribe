import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import categoryRoutes from "./routes/categoryRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", app: "SubScribe API", timestamp: new Date().toISOString() });
});

// Mount Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/groups", groupRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SubScribe API running on http://localhost:${PORT}`);
  });
}

export default app;

