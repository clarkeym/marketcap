import "server-only";

const BASE_URL = "https://finnhub.io/api/v1";
const MAX_CALLS_PER_WINDOW = 50;
const WINDOW_MS = 60_000;

const callTimestamps: number[] = [];

function withinRateLimit(): boolean {
  const now = Date.now();
  while (callTimestamps.length > 0 && now - callTimestamps[0] > WINDOW_MS) {
    callTimestamps.shift();
  }
  if (callTimestamps.length >= MAX_CALLS_PER_WINDOW) {
    return false;
  }
  callTimestamps.push(now);
  return true;
}

export class FinnhubRateLimitError extends Error {
  constructor() {
    super("Finnhub rate limit backstop reached for this process");
    this.name = "FinnhubRateLimitError";
  }
}

export async function fetchFinnhub<T>(
  path: string,
  params: Record<string, string | number>,
): Promise<T> {
  if (!withinRateLimit()) {
    throw new FinnhubRateLimitError();
  }

  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  url.searchParams.set("token", process.env.FINNHUB_API_KEY!);

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Finnhub request failed: ${response.status} ${path}`);
  }
  return response.json() as Promise<T>;
}
