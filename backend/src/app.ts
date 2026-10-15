import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import {
  authenticate,
  authorize,
} from "./middleware/auth.middleware";
import campaignRoutes from "./routes/campaign.routes";
import submissionRoutes from "./routes/submission.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Meme'd API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/submissions", submissionRoutes);

app.get(
  "/api/brand/dashboard",
  authenticate,
  authorize("brand"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to the brand dashboard",
      userId: req.user?.userId,
      role: req.user?.role,
    });
  }
);

export default app;