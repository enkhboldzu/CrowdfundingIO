require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");

const authRoutes    = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const userRoutes    = require("./routes/users");
const adminRoutes   = require("./routes/admin");
const { errorHandler } = require("./middleware/error");

const app = express();

// ── Security & logging ──────────────────────────────────────────────
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── CORS ────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} зөвшөөрөгдөөгүй`));
  },
  credentials: true,
}));

// ── Body parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", ts: new Date() }));

// ── Routes ───────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/admin",    adminRoutes);

// ── 404 ──────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Хаяг олдсонгүй" }));

// ── Error handler ────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
