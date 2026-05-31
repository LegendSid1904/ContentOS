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

function extractJSON(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
  if (jsonMatch) return jsonMatch[1];

  const braceStart = text.indexOf("{");
  const bracketStart = text.indexOf("[");
  const start = braceStart >= 0 && (bracketStart < 0 || braceStart < bracketStart) ? braceStart : bracketStart;
  if (start < 0) throw new Error("No JSON object or array found in response");

  const lastBrace = text.lastIndexOf("}");
  const lastBracket = text.lastIndexOf("]");
  const end = lastBrace > lastBracket ? lastBrace : lastBracket;
  if (end < 0) throw new Error("No closing bracket found in response");

  return text.slice(start, end + 1);
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

  try {
    const cleaned = extractJSON(result.content);
    return JSON.parse(cleaned) as T;
  } catch (e) {
    const snippet = result.content.slice(0, 200).replace(/\n/g, "\\n");
    throw new Error(
      `AI response was not valid JSON. First 200 chars: ${snippet}`
    );
  }
}
