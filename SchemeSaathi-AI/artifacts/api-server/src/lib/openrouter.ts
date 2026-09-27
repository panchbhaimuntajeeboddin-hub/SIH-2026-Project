export interface OpenRouterRequestOptions {
  prompt: string;
  context?: string;
  apiKey?: string;
  model?: string;
  systemOverride?: string;
}

export interface OpenRouterResponse {
  success: boolean;
  reply?: string;
  error?: string;
  model?: string;
  status?: number;
}

/**
 * Robust OpenRouter API Integration for SchemeSaathi AI
 */
export async function callOpenRouterAI(options: OpenRouterRequestOptions): Promise<OpenRouterResponse> {
  const activeKey = options.apiKey || process.env.OPENROUTER_API_KEY;
  const primaryModel = options.model || process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b";
  const fallbackModels = ["meta-llama/llama-3.3-70b-instruct", "google/gemini-2.0-flash-001"];

  if (!activeKey || !activeKey.trim()) {
    console.error("OpenRouter error:", {
      status: 401,
      statusText: "Unauthorized",
      error: "OPENROUTER_API_KEY is not configured",
      hasApiKey: false,
      model: primaryModel
    });

    return {
      success: false,
      error: "OpenRouter API key is not configured on the server."
    };
  }

  const defaultSystemPrompt = `You are SchemeSaathi, an AI-powered government scheme discovery assistant for India.

Your job is to:
- Explain Indian government schemes in simple language.
- Help users understand eligibility criteria.
- Explain required documents.
- Explain benefits.
- Explain application procedures.
- Help users identify potentially relevant schemes based on their profile.
- Support entrepreneurs, students, women, farmers, marginalized communities and other citizens.
- Clearly distinguish verified scheme information from general guidance.
- Never invent scheme names, eligibility criteria, benefits, deadlines, or application links.
- If information is unavailable, clearly say that it needs verification.
- Give concise, practical answers.
- When relevant, ask the user for state, occupation, category, age group, business type, income range, or other information needed to identify suitable schemes.`;

  const systemMessage = options.systemOverride 
    ? options.systemOverride 
    : `${defaultSystemPrompt}${options.context ? `\n\nVerified SchemeSaathi Database Context:\n${options.context}` : ""}`;

  const modelsToTry = [primaryModel, ...fallbackModels.filter(m => m !== primaryModel)];

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${activeKey.trim()}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "SchemeSaathi AI"
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: options.prompt }
          ]
        })
      });

      if (response.ok) {
        const data: any = await response.json();
        const aiReply = data?.choices?.[0]?.message?.content;

        if (aiReply && aiReply.trim()) {
          return {
            success: true,
            reply: aiReply.trim(),
            model: currentModel
          };
        } else {
          console.error("OpenRouter empty response:", {
            status: response.status,
            model: currentModel,
            data
          });
        }
      } else {
        const errorBody = await response.text();
        console.error("OpenRouter error:", {
          status: response.status,
          statusText: response.statusText,
          hasApiKey: true,
          model: currentModel,
          body: errorBody
        });

        // If not the last model and returned 404/400 (e.g. invalid model), try fallback
        if (i < modelsToTry.length - 1 && (response.status === 404 || response.status === 400)) {
          console.warn(`[OpenRouter] Retrying with fallback model ${modelsToTry[i + 1]}...`);
          continue;
        }

        return {
          success: false,
          error: `OpenRouter API returned status ${response.status}: ${errorBody || response.statusText}`,
          status: response.status,
          model: currentModel
        };
      }
    } catch (err: any) {
      console.error("OpenRouter network failure:", {
        error: err?.message || String(err),
        hasApiKey: true,
        model: currentModel
      });

      if (i === modelsToTry.length - 1) {
        return {
          success: false,
          error: `Failed to connect to OpenRouter API: ${err?.message || String(err)}`
        };
      }
    }
  }

  return {
    success: false,
    error: "Failed to generate AI response."
  };
}
