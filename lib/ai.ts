import OpenAI from "openai";

const apiKey = process.env.GROQ_API_KEY ?? "";
const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

export const groq = new OpenAI({
  apiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateText(params: {
  systemPrompt: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}) {
  const { systemPrompt, prompt, maxTokens = 4096, temperature = 0.7 } = params;

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    max_tokens: maxTokens,
    temperature,
  });

  const content = completion.choices[0]?.message?.content ?? "";

  return {
    content,
    usage: {
      inputTokens: completion.usage?.prompt_tokens ?? 0,
      outputTokens: completion.usage?.completion_tokens ?? 0,
    },
  };
}

export async function generateJSON<T>(params: {
  systemPrompt: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<T> {
  const result = await generateText({
    ...params,
    temperature: params.temperature ?? 0.3,
  });

  return JSON.parse(result.content) as T;
}
