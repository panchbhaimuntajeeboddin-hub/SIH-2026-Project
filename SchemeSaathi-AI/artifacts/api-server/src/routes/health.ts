import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    name: "SchemeSaathi AI API Server Backend",
    version: "1.0.0",
    message: "SchemeSaathi API Backend Node Server is active and operational.",
    endpoints: {
      health: "/api/health",
      knowledgeSchemes: "/api/knowledge/schemes",
      knowledgeResources: "/api/knowledge/resources",
      udyamSearch: "/api/udyam/search",
      authSendOtp: "/api/auth/send-otp",
      authVerifyOtp: "/api/auth/verify-otp",
      smartMatch: "/api/knowledge/smart-match"
    }
  });
});

router.get("/health", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
