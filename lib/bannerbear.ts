const BB_API = "https://sync.api.bannerbear.com/v2";

interface BBImageResult {
  uid: string;
  image_url: string;
  image_url_png: string;
  status: string;
}

export async function generateBBImage(
  templateId: string,
  modifications: { text: string; text_value: string; color?: string }[]
) {
  const apiKey = process.env.BANNERBEAR_API_KEY;
  if (!apiKey) {
    throw new Error("BANNERBEAR_API_KEY not set — sign up at bannerbear.com, get API key, add to .env");
  }

  const res = await fetch(`${BB_API}/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template: templateId,
      modifications,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Bannerbear API error (${res.status}): ${err}`);
  }

  const data = (await res.json()) as BBImageResult;
  return {
    uid: data.uid,
    pngUrl: data.image_url_png,
    status: data.status,
  };
}

export async function generateBBSlides(
  slides: { headline: string; copy: string; slide_number: number }[],
  templateId: string
) {
  const results = [];
  for (const slide of slides) {
    const result = await generateBBImage(templateId, [
      { text: "headline", text_value: slide.headline },
      { text: "copy", text_value: slide.copy },
      { text: "slide_number", text_value: `Slide ${slide.slide_number}` },
    ]);
    results.push({ slide_number: slide.slide_number, ...result });
  }
  return results;
}

export async function generateBBThumbnails(
  concepts: { concept_name: string; headline_text: string; visual_description: string }[],
  templateId: string
) {
  const results = [];
  for (const c of concepts) {
    const result = await generateBBImage(templateId, [
      { text: "headline", text_value: c.headline_text },
      { text: "description", text_value: c.visual_description },
      { text: "concept_name", text_value: c.concept_name },
    ]);
    results.push({ concept_name: c.concept_name, ...result });
  }
  return results;
}
