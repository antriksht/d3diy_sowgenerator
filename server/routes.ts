import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Generation endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      const { sectionTitle, yourCompany, clientCompany, project, useSystemKeys, openaiApiKey, geminiApiKey } = req.body;

      // Use system keys or provided keys
      const effectiveOpenAIKey = useSystemKeys ? process.env.OPENAI_API_KEY : openaiApiKey;
      const effectiveGeminiKey = useSystemKeys ? process.env.GEMINI_API_KEY : geminiApiKey;

      if (!effectiveOpenAIKey && !effectiveGeminiKey) {
        return res.status(400).json({ error: "No API keys available. Please configure API keys in settings." });
      }

      // Create detailed prompt
      const prompt = `Write a professional ${sectionTitle} section for a Statement of Work document.

Client Company: ${clientCompany.name}
Client Description: ${clientCompany.description}

Your Company: ${yourCompany.name}
Company Description: ${yourCompany.description}

Project Title: ${project.title}
Service Description: ${project.serviceDescription}
${project.annualBudget ? `Annual Project Budget: ${project.annualBudget}` : ''}
${project.targetGeo ? `Target Geographic Area: ${project.targetGeo}` : ''}

IMPORTANT: Write ONLY the content for the "${sectionTitle}" section. Do not include section headings, titles, or any other parts of the document. Just provide the body content for this specific section that would appear under the "${sectionTitle}" heading.

Please write comprehensive, professional content that is appropriate for this section of a Statement of Work document. Use clear formatting with bullet points, numbered lists, or tables where appropriate. Make it specific to this project and companies involved.`;

      let result = "";

      // Try OpenAI first, then Gemini as fallback
      if (effectiveOpenAIKey) {
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${effectiveOpenAIKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "You are a professional business proposal writer. Generate well-structured, professional content for Statement of Work documents. Use appropriate formatting, bullet points, and tables where relevant.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              max_tokens: 8000,
              temperature: 0.5,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            result = data.choices[0]?.message?.content || "";
          }
        } catch (error) {
          console.error("OpenAI error:", error);
        }
      }

      // Try Gemini if OpenAI failed or unavailable
      if (!result && effectiveGeminiKey) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveGeminiKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: prompt,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.5,
                  maxOutputTokens: 8000,
                },
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            result = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          }
        } catch (error) {
          console.error("Gemini error:", error);
        }
      }

      if (!result) {
        return res.status(500).json({ error: "Failed to generate content with available AI services." });
      }

      res.json({ content: result });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ error: "Internal server error during content generation." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
