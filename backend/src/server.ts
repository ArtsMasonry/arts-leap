import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT ?? 4000);
const ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: ORIGIN, credentials: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Placeholder routes (we'll replace with real entities)
app.get("/api/version", (_req, res) => res.json({ version: "0.0.1" }));

app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT} (CORS: ${ORIGIN})`);
});
