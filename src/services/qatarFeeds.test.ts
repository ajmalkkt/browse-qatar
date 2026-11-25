import { afterEach, describe, expect, it, vi } from "vitest";
import { getQatarEventList, getQatarNewsList, getQatarStockTicker } from "./qatarFeeds";

vi.mock("../config/apiConfig", () => ({ BASE_API: "https://backend.example/api" }));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Qatar news feed", () => {
  it("uses the backend feed without exposing provider credentials in the request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([
      {
        id: "article-1",
        title: "Qatar headline",
        url: "https://example.com/news",
        source: "Example News",
        publishedAt: "2025-01-01",
        imageUrl: "https://example.com/image.jpg",
      },
    ]), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const articles = await getQatarNewsList({ limit: 5 });

    expect(articles).toHaveLength(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain("/qatar-feeds/news?language=en&limit=5");
    expect(String(fetchMock.mock.calls[0][0])).not.toContain("apikey");
  });

  it("returns the backend-provided fallback without making a browser-side provider request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([
      {
        id: "fallback-1",
        title: "Fallback headline",
        url: "https://example.com/fallback",
        source: "Example",
        publishedAt: "2025-01-01",
        imageUrl: "https://example.com/fallback.jpg",
      },
    ]), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const articles = await getQatarNewsList({ limit: 5 });

    expect(articles[0]).toMatchObject({
      title: "Fallback headline",
      url: "https://example.com/fallback",
      imageUrl: "https://example.com/fallback.jpg",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain("backend.example/api/qatar-feeds/news");
  });
});

describe("Qatar stock feed", () => {
  it("reads quote batches and refresh timing from the backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [{
        symbol: "QNBK",
        name: "QNBK",
        price: 15.2,
        change: 0.1,
        percentChange: 0.66,
        currency: "QAR",
        timestamp: "2026-11-24",
      }],
      refreshInProgress: true,
      nextPollMs: 65000,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await getQatarStockTicker();

    expect(response.items).toHaveLength(1);
    expect(response.refreshInProgress).toBe(true);
    expect(response.nextPollMs).toBe(65000);
  });

  it("preserves the backend Retry-After delay on rate limits", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: "Qatar stock feed is temporarily unavailable." }),
      { status: 429, headers: { "Retry-After": "3600", "Content-Type": "application/json" } },
    ));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getQatarStockTicker()).rejects.toMatchObject({
      name: "QatarFeedRequestError",
      retryAfterMs: 3600000,
    });
  });

  describe("Qatar events feed", () => {
    it("returns events beyond the initial three-card carousel view", async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(
        Array.from({ length: 5 }, (_, index) => ({
          id: `event-${index}`,
          title: `Event ${index + 1}`,
          dateText: "Upcoming",
          venue: "Doha, Qatar",
        })),
      ), { status: 200, headers: { "Content-Type": "application/json" } }));
      vi.stubGlobal("fetch", fetchMock);

      const events = await getQatarEventList();

      expect(events).toHaveLength(5);
      expect(String(fetchMock.mock.calls[0][0])).toContain("/qatar-feeds/events?q=events+in+Qatar");
    });
  });
});
