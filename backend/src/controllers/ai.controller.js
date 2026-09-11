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
  const lowerPrompt = cleanPrompt.toLowerCase();

  let title = "";
  let description = "";

  // ==========================================
  // 1. Try Gemini AI
  // ==========================================
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
                    text: `
You are a task management assistant.

Convert the user's task idea into a clear and useful task.

User input:
"${cleanPrompt}"

Return ONLY valid JSON in exactly this format:
{
  "title": "short clear task title",
  "description": "short practical description of what should be done"
}

Rules:
- Keep the title concise.
- Make the description practical and specific.
- If the input is very short or ambiguous, make a reasonable assumption.
- Do not mention that you are making an assumption.
- Do not add markdown.
- Do not add extra text outside the JSON.
`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned ${response.status}`);
      }

      const data = await response.json();

      const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textOutput) {
        const cleanedText = textOutput
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        const parsed = JSON.parse(cleanedText);

        if (
          typeof parsed.title === "string" &&
          typeof parsed.description === "string"
        ) {
          title = parsed.title.trim();
          description = parsed.description.trim();
        }
      }
    } catch (err) {
      console.warn(
        "Gemini API failed. Using fallback task suggestion:",
        err.message
      );
    }
  }

  // ==========================================
  // 2. Smart fallback
  // ==========================================
  if (!title) {
    if (
      lowerPrompt.includes("designer") ||
      lowerPrompt.includes("design")
    ) {
      title = "Follow up with UI/UX Designer";

      description =
        "Send a message to confirm the wireframe delivery status and review the latest design updates.";
    } else if (
      lowerPrompt.includes("bug") ||
      lowerPrompt.includes("fix") ||
      lowerPrompt.includes("error")
    ) {
      title = `Fix Issue: ${
        cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1)
      }`;

      description =
        "Reproduce the issue, identify the root cause, implement the fix, and verify that the problem is resolved.";
    } else if (
      lowerPrompt.includes("meeting") ||
      lowerPrompt.includes("sync") ||
      lowerPrompt.includes("call")
    ) {
      title = `Prepare for ${
        cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1)
      }`;

      description =
        "Review the agenda, prepare the required information, and note down the key points to discuss.";
    } else if (
      lowerPrompt.includes("report") ||
      lowerPrompt.includes("document") ||
      lowerPrompt.includes("doc") ||
      lowerPrompt.includes("write")
    ) {
      title = `Prepare ${
        cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1)
      }`;

      description =
        "Gather the required information, organize the main points, prepare the first draft, and review it before completion.";
    } else if (
      lowerPrompt === "java" ||
      lowerPrompt === "javascript" ||
      lowerPrompt === "js" ||
      lowerPrompt === "react" ||
      lowerPrompt === "node" ||
      lowerPrompt === "nodejs" ||
      lowerPrompt === "mongodb"
    ) {
      // Reasonable suggestions for short/ambiguous technology inputs
      const technologyMap = {
        java: {
          title: "Learn Java",
          description:
            "Study Java fundamentals, practice core concepts, and build small programs to strengthen programming skills.",
        },

        javascript: {
          title: "Learn JavaScript",
          description:
            "Study JavaScript fundamentals, practice core concepts, and build small programs to improve programming skills.",
        },

        js: {
          title: "Learn JavaScript",
          description:
            "Study JavaScript fundamentals, practice core concepts, and build small programs to improve programming skills.",
        },

        react: {
          title: "Learn React",
          description:
            "Study React fundamentals, practice components and hooks, and build a small project to strengthen React skills.",
        },

        node: {
          title: "Learn Node.js",
          description:
            "Study Node.js fundamentals, practice APIs and modules, and build a small backend feature.",
        },

        nodejs: {
          title: "Learn Node.js",
          description:
            "Study Node.js fundamentals, practice APIs and modules, and build a small backend feature.",
        },

        mongodb: {
          title: "Learn MongoDB",
          description:
            "Study MongoDB basics, practice CRUD operations and queries, and work with sample data.",
        },
      };

      title = technologyMap[lowerPrompt].title;
      description = technologyMap[lowerPrompt].description;
    } else {
      // ==========================================
      // General fallback
      // ==========================================
      const words = cleanPrompt.split(/\s+/);

      const capitalizedWords = words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      title =
        capitalizedWords.length > 50
          ? `${capitalizedWords.slice(0, 50)}...`
          : capitalizedWords;

      description = `Complete the required work for "${cleanPrompt}", break it into actionable steps, and track progress until it is finished.`;
    }
  }

  // ==========================================
  // 3. Response
  // ==========================================
  res.status(200).json({
    success: true,
    prompt: cleanPrompt,
    suggestion: {
      title,
      description,
    },
  });
};