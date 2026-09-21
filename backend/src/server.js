import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes.js";
import referralRoutes from "./routes/referral.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Local development
      if (origin === "http://localhost:5173") {
        return callback(null, true);
      }

      // Production frontend URL
      if (origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }

      // Vercel preview deployments
      if (
        /^https:\/\/referral-commission-demo-[a-z0-9-]+\.vercel\.app$/.test(
          origin,
        )
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  }),
);

app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/admin", adminRoutes);

// Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
