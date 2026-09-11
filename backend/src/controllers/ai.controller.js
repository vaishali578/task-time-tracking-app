import AppError from "../utils/AppError.js";

/**
 * Smart AI Task Suggestion Generator
 * Accepts natural language inputs (e.g., "follow up with designer")
 * and generates structured title & description.
 */
export const suggestTask = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    throw new AppError("Prompt text is required for AI suggestion", 400);
  }

  const cleanPrompt = prompt.trim();
  const lowerPrompt = cleanPrompt.toLowerCase();

  let title = "";
  let description = "";

  // 1. Check if Gemini / OpenAI API Key is provided in environment
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an AI task optimization assistant. Given the natural language task input: "${cleanPrompt}", respond ONLY with a valid JSON object in the format: {"title": "Clear concise title", "description": "Structured description detailing what needs to be done."}. Do not include markdown code block syntax.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textOutput) {
        const cleanedText = textOutput.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanedText);
        title = parsed.title;
        description = parsed.description;
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to smart NLP engine:", err);
    }
  }

  // 2. Smart NLP Engine Fallback if AI key is absent or API call failed
  if (!title) {
    if (lowerPrompt.includes("designer") || lowerPrompt.includes("design")) {
      title = "Follow up with UI/UX Designer";
      description = "Send a message to confirm wireframe delivery status and review design assets for the upcoming release.";
    } else if (lowerPrompt.includes("bug") || lowerPrompt.includes("fix") || lowerPrompt.includes("error")) {
      title = `Investigate & Fix Issue: ${cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1)}`;
      description = "Reproduce the reported bug, locate root cause in codebase, write patch, and verify with unit tests.";
    } else if (lowerPrompt.includes("meeting") || lowerPrompt.includes("sync") || lowerPrompt.includes("call")) {
      title = `Schedule & Prepare for ${cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1)}`;
      description = "Draft meeting agenda, notify team participants, and compile discussion topics prior to the call.";
    } else if (lowerPrompt.includes("report") || lowerPrompt.includes("doc") || lowerPrompt.includes("write")) {
      title = `Draft & Review: ${cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1)}`;
      description = "Outline key sections, gather necessary statistics, write initial draft, and share for peer feedback.";
    } else {
      // General natural language transformer
      const words = cleanPrompt.split(" ");
      const capitalizedWords = words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      title = capitalizedWords.length > 50 ? capitalizedWords.slice(0, 50) + "..." : capitalizedWords;
      description = `Execute actionable steps for "${cleanPrompt}". Track progress and log hours spent upon completion.`;
    }
  }

  res.status(200).json({
    success: true,
    prompt: cleanPrompt,
    suggestion: {
      title,
      description,
    },
  });
};
