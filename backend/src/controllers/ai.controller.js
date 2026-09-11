import AppError from "../utils/AppError.js";

/**
 * AI Task Suggestion Generator
 * Accepts natural language input and generates
 * a clear task title and structured description.
 */
export const suggestTask = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    throw new AppError("Prompt text is required for AI suggestion", 400);
  }

  const cleanPrompt = prompt.trim();
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  if (!process.env.GEMINI_API_KEY) {
    throw new AppError("AI generation failed. Please try again.", 502);
  }

  let suggestion;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
                  text: `You are a task management assistant. Understand the user's input and convert it into a clear, actionable task.

Generate a concise title and a useful 1-2 sentence description. Do not invent unnecessary details. If the input is brief or ambiguous, make only the most reasonable interpretation.

Return ONLY a valid JSON object with exactly these two string properties:
{"title":"...","description":"..."}

Do not return markdown, explanation, or code fences. Do not include any text before or after the JSON.

User input:
${JSON.stringify(cleanPrompt)}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      throw new Error("Gemini returned an empty response");
    }

    const parsed = JSON.parse(textOutput);

    if (
      !parsed ||
      typeof parsed.title !== "string" ||
      typeof parsed.description !== "string" ||
      !parsed.title.trim() ||
      !parsed.description.trim()
    ) {
      throw new Error("Gemini returned an invalid suggestion");
    }

    suggestion = {
      title: parsed.title.trim(),
      description: parsed.description.trim(),
    };
  } catch (err) {
    console.error("Gemini API failed:", err.message);
    throw new AppError("AI generation failed. Please try again.", 502);
  }

  res.status(200).json({
    success: true,
    prompt: cleanPrompt,
    suggestion,
  });
};