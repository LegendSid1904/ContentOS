interface SearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export async function searchWeb(
  query: string,
  maxResults = 5
): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY not set");

  const resp = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, query, max_results: maxResults }),
  });

  if (!resp.ok) throw new Error(`Tavily search failed: ${resp.statusText}`);

  const data = await resp.json();
  return data.results ?? [];
}
