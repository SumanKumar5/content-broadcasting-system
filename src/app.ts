import cors from "cors";
import "dotenv/config";
import express from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import { authLimiter, publicApiLimiter } from "./middlewares/rateLimiter";
import analyticsRoutes from "./routes/analytics.routes";
import authRoutes from "./routes/auth.routes";
import broadcastingRoutes from "./routes/broadcasting.routes";
import contentRoutes from "./routes/content.routes";
import { swaggerSpec } from "./utils/swagger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/content", publicApiLimiter, broadcastingRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

export default app;
