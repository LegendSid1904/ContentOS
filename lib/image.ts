import OpenAI from "openai";
import { uploadFile, getPublicUrl } from "@/lib/storage";

const together = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY ?? "",
  baseURL: "https://api.together.xyz/v1",
});

export const IMAGE_MODELS = {
  "flux-schnell": "black-forest-labs/FLUX.1-schnell",
  "flux-dev": "black-forest-labs/FLUX.1-dev",
  sdxl: "stabilityai/stable-diffusion-xl-base-1.0",
} as const;

export type ImageModel = keyof typeof IMAGE_MODELS;

export interface GeneratedImage {
  index: number;
  b64_json: string;
  revised_prompt: string;
  url?: string;
  storageUrl?: string;
}

export async function generateImage(params: {
  prompt: string;
  model?: ImageModel | string;
  n?: number;
  size?: "1024x1024" | "1024x768" | "768x1024" | "1280x720" | "720x1280";
  store?: boolean;
  storagePath?: string;
}): Promise<GeneratedImage[]> {
  const {
    prompt,
    model = "flux-schnell",
    n = 1,
    size = "1024x1024",
    store = false,
    storagePath,
  } = params;

  const modelId = IMAGE_MODELS[model as ImageModel] ?? model;

  const response = await together.images.generate({
    model: modelId,
    prompt,
    n,
    size,
    response_format: "b64_json",
  });

  const images: GeneratedImage[] = [];

  if (!response.data) return images;

  for (let i = 0; i < response.data.length; i++) {
    const img = response.data[i];
    const b64_json = img.b64_json ?? "";
    const revised_prompt = img.revised_prompt ?? prompt;

    let storageUrl: string | undefined;

    if (store && b64_json) {
      const buf = Buffer.from(b64_json, "base64");
      const path = storagePath ?? `images/${Date.now()}_${i}.png`;
      await uploadFile(path, new Blob([buf], { type: "image/png" }), "image/png");
      storageUrl = await getPublicUrl(path);
    }

    images.push({ index: i, b64_json, revised_prompt, storageUrl });
  }

  return images;
}

export async function generateCarouselSlideImages(params: {
  slides: { slide_number: number; headline: string; visual_direction: string }[];
  topic: string;
  brandColor?: string;
}): Promise<{ slide_number: number; image: GeneratedImage }[]> {
  const { slides, topic, brandColor = "violet and teal" } = params;

  const results: { slide_number: number; image: GeneratedImage }[] = [];

  for (const slide of slides) {
    const prompt = [
      `A social media carousel slide about "${topic}".`,
      `Slide headline: "${slide.headline}".`,
      `Style: ${slide.visual_direction}.`,
      `Colors: ${brandColor}. Clean modern design, readable text area on the right,`,
      `abstract visual on the left. Professional, high contrast, no text in the image itself.`,
    ].join(" ");

    const [image] = await generateImage({
      prompt,
      model: "flux-schnell",
      size: "768x1024",
      store: true,
      storagePath: `carousels/${Date.now()}_slide_${slide.slide_number}.png`,
    });

    results.push({ slide_number: slide.slide_number, image });
  }

  return results;
}

export async function generateThumbnailImage(params: {
  concept_name: string;
  headline_text: string;
  visual_description: string;
  color_palette: string[];
  background_suggestion: string;
  props: string[];
}): Promise<GeneratedImage> {
  const { concept_name, headline_text, visual_description, color_palette, background_suggestion, props } = params;

  const prompt = [
    `YouTube thumbnail: "${concept_name}".`,
    `Text overlay: "${headline_text}".`,
    `Visual: ${visual_description}.`,
    `Background: ${background_suggestion}.`,
    `Colors: ${color_palette.join(", ")}.`,
    `Props/elements: ${props.join(", ")}.`,
    `High contrast, bold, CTR-optimized YouTube thumbnail style.`,
    `16:9 aspect ratio. No embedded text — leave space for overlay text.`,
  ].join(" ");

  const [image] = await generateImage({
    prompt,
    model: "flux-schnell",
    size: "1280x720",
    store: true,
    storagePath: `thumbnails/${Date.now()}_${concept_name.replace(/\s+/g, "_").toLowerCase()}.png`,
  });

  return image;
}
