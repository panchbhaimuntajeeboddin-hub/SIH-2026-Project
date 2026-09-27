import { Router, type IRouter } from "express";
import { callOpenRouterAI } from "../lib/openrouter";

const router: IRouter = Router();

/**
 * GET /api/ai/test
 * Standalone test endpoint to verify OpenRouter connectivity & API key
 */
router.get("/ai/test", async (_req, res) => {
  const hasApiKey = Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim());
  const selectedModel = process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b";

  if (!hasApiKey) {
    res.status(401).json({
      success: false,
      error: "OpenRouter API key is not configured on the server.",
      hasApiKey: false,
      configuredModel: selectedModel,
      instruction: "Please set OPENROUTER_API_KEY=your_key in your .env file and restart the server."
    });
    return;
  }

  const result = await callOpenRouterAI({
    prompt: "Reply with exactly: SchemeSaathi AI is working."
  });

  if (!result.success) {
    res.status(result.status || 500).json({
      success: false,
      error: result.error,
      hasApiKey: true,
      configuredModel: selectedModel
    });
    return;
  }

  res.json({
    success: true,
    reply: result.reply,
    model: result.model
  });
});

/**
 * POST /api/ai/chat
 * Direct testing endpoint for AI queries
 */
router.post("/ai/chat", async (req, res) => {
  const message = req.body?.message || req.body?.prompt || req.body?.text;

  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({
      success: false,
      error: "Message is required in request body e.g. { \"message\": \"What schemes are available?\" }"
    });
    return;
  }

  const result = await callOpenRouterAI({
    prompt: message.trim()
  });

  if (!result.success) {
    res.status(result.status || 500).json({
      success: false,
      error: result.error
    });
    return;
  }

  res.json({
    success: true,
    reply: result.reply,
    model: result.model
  });
});

export default router;
