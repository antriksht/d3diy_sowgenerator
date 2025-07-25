import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

function cleanAIResponse(content: string, sectionTitle: string): string {
  let cleaned = content;
  
  // Find and remove everything after "---" marker (including the dashes themselves)
  const dashMarkerIndex = cleaned.indexOf('---');
  if (dashMarkerIndex !== -1) {
    cleaned = cleaned.substring(0, dashMarkerIndex);
  }
  
  // Also check for single or double dashes at the end
  const singleDashIndex = cleaned.lastIndexOf('\n-');
  if (singleDashIndex !== -1 && singleDashIndex > cleaned.length - 10) {
    cleaned = cleaned.substring(0, singleDashIndex);
  }
  
  const doubleDashIndex = cleaned.lastIndexOf('\n--');
  if (doubleDashIndex !== -1 && doubleDashIndex > cleaned.length - 10) {
    cleaned = cleaned.substring(0, doubleDashIndex);
  }
  
  // Additional cleanup patterns for any remaining unwanted content
  const unwantedPatterns = [
    /This .+ section is designed to .+$/gi,
    /This .+ is designed to .+$/gi,
    /\n*This section .+$/gi,
    /\n*---+.*$/gi,
    /\n*--+.*$/gi,
    /\n*-+\s*$/gi,  // Remove trailing dashes
    /\n*\*\*Note:.*$/gi,
    /\n*Note:.*$/gi
  ];
  
  for (const pattern of unwantedPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Clean up excessive whitespace and trim
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  
  return cleaned;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Generation endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      const {
        sectionTitle,
        yourCompany,
        clientCompany,
        project,
        useSystemKeys,
        openaiApiKey,
        geminiApiKey,
        customPrompt,
        sectionExample,
      } = req.body;

      // Use system keys or provided keys
      const effectiveOpenAIKey = useSystemKeys
        ? process.env.OPENAI_API_KEY
        : openaiApiKey;
      const effectiveGeminiKey = useSystemKeys
        ? process.env.GEMINI_API_KEY
        : geminiApiKey;

      if (!effectiveOpenAIKey && !effectiveGeminiKey) {
        return res
          .status(400)
          .json({
            error:
              "No API keys available. Please configure API keys in settings.",
          });
      }

      // Build dynamic prompt using custom prompts or fallback
      const buildPrompt = () => {
        // If custom prompt is provided, use it with minimal context
        if (customPrompt) {
          let prompt = `${customPrompt}

Client Company: ${clientCompany.name}
Client Description: ${clientCompany.description}

Your Company: ${yourCompany.name}
Company Description: ${yourCompany.description}`;

          // Only add project info if this is NOT the Introduction section
          if (sectionTitle !== 'Introduction') {
            prompt += `

Project Title: ${project.title}
Service Description: ${project.serviceDescription}
${project.annualBudget ? `Annual Project Budget: ${project.annualBudget}` : ""}
${project.targetGeo ? `Target Geographic Area: ${project.targetGeo}` : ""}`;
          }

          // Add section example if provided and not Introduction
          if (sectionExample && sectionTitle !== 'Introduction') {
            prompt += `

EXAMPLE FORMAT FOR ${sectionTitle.toUpperCase()} SECTION:
Use this as inspiration for structure and style, but customize all content for the actual companies:

${sectionExample}`;
          } else if (sectionExample && sectionTitle === 'Introduction') {
            prompt += `

EXAMPLE FORMAT FOR COMPANY INTRODUCTIONS:
Use this structure but only write about the companies themselves:

${sectionExample}`;
          }

          return prompt;
        }

        // Fallback prompt when no custom prompt is provided
        const basePrompt = `Write a professional ${sectionTitle} section for a Statement of Work document.

Client Company: ${clientCompany.name}
Client Description: ${clientCompany.description}

Your Company: ${yourCompany.name}
Company Description: ${yourCompany.description}

Project Title: ${project.title}
Service Description: ${project.serviceDescription}
${project.annualBudget ? `Annual Project Budget: ${project.annualBudget}` : ""}
${project.targetGeo ? `Target Geographic Area: ${project.targetGeo}` : ""}

IMPORTANT: Write ONLY the content for the "${sectionTitle}" section. Do not include section headings, titles, or any other parts of the document. Just provide the body content for this specific section that would appear under the "${sectionTitle}" heading.

Please write comprehensive, professional content that is appropriate for this section of a Statement of Work document. Use clear formatting with bullet points, numbered lists, or tables where appropriate. Make it specific to this project and companies involved.`;

        // Add section example if provided
        if (sectionExample) {
          return `${basePrompt}

EXAMPLE FORMAT FOR ${sectionTitle.toUpperCase()} SECTION:
Use this as inspiration for structure and style, but customize all content for the actual companies and project:

${sectionExample}`;
        }

        return basePrompt;
      };

      const prompt = buildPrompt();

      // Log the full prompt being sent to AI
      console.log("\n=== AI GENERATION REQUEST ===");
      console.log(`Section: ${sectionTitle}`);
      console.log(`Client: ${clientCompany.name}`);
      console.log(`Service Provider: ${yourCompany.name}`);
      console.log(`Project: ${project.title}`);
      console.log("\n--- FULL PROMPT ---");
      console.log(prompt);
      console.log("\n--- END PROMPT ---\n");

      let result = "";

      // Try OpenAI first, then Gemini as fallback
      if (effectiveOpenAIKey) {
        try {
          console.log("\n=== TRYING OPENAI ===");
          console.log("Model: gpt-4o-mini");
          console.log("Temperature: 0.8");
          console.log("Max tokens: 8000");

          const openaiBody = {
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a professional business proposal writer. Generate well-structured, professional content for Statement of Work documents. Use appropriate formatting, bullet points, and tables where relevant.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 8000,
            temperature: 0.5,
          };

          console.log("\n--- OPENAI REQUEST BODY ---");
          console.log(JSON.stringify(openaiBody, null, 2));

          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${effectiveOpenAIKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(openaiBody),
            },
          );

          console.log(`\n--- OPENAI RESPONSE STATUS: ${response.status} ---`);

          if (response.ok) {
            const data = await response.json();
            console.log("\n--- OPENAI RESPONSE DATA ---");
            console.log(JSON.stringify(data, null, 2));

            result = data.choices[0]?.message?.content || "";
            console.log("\n--- EXTRACTED CONTENT ---");
            console.log(result);
            console.log("\n--- END OPENAI SUCCESS ---\n");
          } else {
            const errorData = await response.text();
            console.log("\n--- OPENAI ERROR RESPONSE ---");
            console.log(errorData);
            console.log("\n--- END OPENAI ERROR ---\n");
          }
        } catch (error) {
          console.log("\n--- OPENAI EXCEPTION ---");
          console.error("OpenAI error:", error);
          console.log("\n--- END OPENAI EXCEPTION ---\n");
        }
      }

      // Try Gemini if OpenAI failed or unavailable
      if (!result && effectiveGeminiKey) {
        try {
          console.log("\n=== TRYING GEMINI ===");
          console.log("Model: gemini-2.5-flash");
          console.log("Temperature: 0.5");
          console.log("Max tokens: 8000");

          const geminiBody = {
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
          };

          console.log("\n--- GEMINI REQUEST BODY ---");
          console.log(JSON.stringify(geminiBody, null, 2));

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveGeminiKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(geminiBody),
            },
          );

          console.log(`\n--- GEMINI RESPONSE STATUS: ${response.status} ---`);

          if (response.ok) {
            const data = await response.json();
            console.log("\n--- GEMINI RESPONSE DATA ---");
            console.log(JSON.stringify(data, null, 2));

            result = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            console.log("\n--- EXTRACTED CONTENT ---");
            console.log(result);
            console.log("\n--- END GEMINI SUCCESS ---\n");
          } else {
            const errorData = await response.text();
            console.log("\n--- GEMINI ERROR RESPONSE ---");
            console.log(errorData);
            console.log("\n--- END GEMINI ERROR ---\n");
          }
        } catch (error) {
          console.log("\n--- GEMINI EXCEPTION ---");
          console.error("Gemini error:", error);
          console.log("\n--- END GEMINI EXCEPTION ---\n");
        }
      }

      if (!result) {
        console.log("\n=== FINAL ERROR ===");
        console.log("No content generated from any AI service");
        console.log("OpenAI Available:", !!effectiveOpenAIKey);
        console.log("Gemini Available:", !!effectiveGeminiKey);
        console.log("=== END FINAL ERROR ===\n");
        return res
          .status(500)
          .json({
            error: "Failed to generate content with available AI services.",
          });
      }

      // Clean up unwanted content from AI responses
      result = cleanAIResponse(result, sectionTitle);

      console.log("\n=== GENERATION SUCCESS ===");
      console.log(`Section: ${sectionTitle}`);
      console.log("Content Length:", result.length);
      console.log("Content Preview:", result.substring(0, 200) + "...");
      console.log("=== END SUCCESS ===\n");

      res.json({ content: result });
    } catch (error: any) {
      console.log("\n=== CRITICAL ERROR ===");
      console.error("Generation error:", error);
      console.log("Error details:", error?.message || "Unknown error");
      console.log("Error stack:", error?.stack || "No stack trace");
      console.log("=== END CRITICAL ERROR ===\n");
      res
        .status(500)
        .json({ error: "Internal server error during content generation." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
