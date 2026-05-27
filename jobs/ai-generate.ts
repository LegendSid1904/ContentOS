import { task } from "@trigger.dev/sdk/v3";

export const generateContent = task({
  id: "generate-content",
  run: async (payload: {
    systemPrompt: string;
    prompt: string;
    schema?: Record<string, unknown>;
  }) => {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: payload.systemPrompt },
            { role: "user", content: payload.prompt },
          ],
          ...(payload.schema ? { response_format: { type: "json_object" } } : {}),
        }),
      },
    );

    return response.json();
  },
});
