import { BASE_API } from "../config/apiConfig";

export interface StockQuoteItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
  currency: string;
  timestamp: string;
}

export interface StockFeedResponse {
  items: StockQuoteItem[];
  refreshInProgress: boolean;
  nextPollMs: number;
}

export interface NewsArticleItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

export interface QatarEventItem {
  id: string;
  title: string;
  dateText: string;
  venue: string;
  url?: string;
  imageUrl?: string;
  thumbnail?: string;
  source?: string;
  description?: string;
}

export class QatarFeedRequestError extends Error {
  constructor(status: number, readonly retryAfterMs?: number) {
    super(`Qatar feed service failed (${status})`);
    this.name = "QatarFeedRequestError";
  }
}

function getFeedUrl(path: string, params?: URLSearchParams) {
  const configuredBase = typeof BASE_API === "string" ? BASE_API.trim() : "";
  if (!configuredBase) throw new Error("Backend API base URL is not configured");
  const base = configuredBase.replace(/\/+$/, "");
  const query = params?.toString();
  return `${base}/qatar-feeds/${path}${query ? `?${query}` : ""}`;
}

function getRetryAfterMs(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const retryAt = Date.parse(value);
  return Number.isFinite(retryAt) ? Math.max(0, retryAt - Date.now()) : undefined;
}

async function fetchBackendFeed<T>(path: string, params?: URLSearchParams): Promise<T> {
  const response = await fetch(getFeedUrl(path, params));
  if (!response.ok) {
    throw new QatarFeedRequestError(
      response.status,
      getRetryAfterMs(response.headers.get("Retry-After")),
    );
  }
  return response.json() as Promise<T>;
}

export async function getQatarStockTicker(): Promise<StockFeedResponse> {
  return fetchBackendFeed<StockFeedResponse>("stocks");
}

export async function getQatarNewsList(
  options: {
    language?: "en" | "ar";
    limit?: number;
  } = {},
): Promise<NewsArticleItem[]> {
  const { language = "en", limit = 15 } = options;
  const safeLimit = Math.min(20, Math.max(1, Math.floor(limit)));
  const params = new URLSearchParams({ language, limit: String(safeLimit) });
  const items = await fetchBackendFeed<NewsArticleItem[]>("news", params);
  return Array.isArray(items) ? items.slice(0, safeLimit) : [];
}

export async function getQatarEventList(
  options: { queryText?: string } = {},
): Promise<QatarEventItem[]> {
  const params = new URLSearchParams({ q: options.queryText ?? "events in Qatar" });
  const items = await fetchBackendFeed<QatarEventItem[]>("events", params);
  return Array.isArray(items) ? items.slice(0, 20) : [];
}
