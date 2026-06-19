const API_BASE = "https://generativelanguage.googleapis.com/v1";

export async function generateImage(
  prompt: string,
  apiKey?: string
): Promise<string> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY not set — get one free at https://aistudio.google.com/apikey");
  }

  const res = await fetch(`${API_BASE}/models/imagen-3.0-generate-001:predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 403 || res.status === 429) {
      throw new Error(`Gemini API quota/access error (${res.status}) — check your billing at https://aistudio.google.com`);
    }
    throw new Error(`Imagen API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const prediction = data.predictions?.[0];
  if (!prediction?.bytesBase64Encoded) {
    throw new Error("Imagen returned no image data");
  }

  return `data:image/png;base64,${prediction.bytesBase64Encoded}`;
}
