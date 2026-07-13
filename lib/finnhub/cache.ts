import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { fetchFinnhub } from "@/lib/finnhub/client";
import type {
  CandlePoint,
  FinnhubCandles,
  FinnhubProfile,
  FinnhubQuote,
  Quote,
  StockProfile,
} from "@/lib/finnhub/types";

const QUOTE_TTL_MS = 20_000;
const PROFILE_TTL_MS = 24 * 60 * 60 * 1000;
const DAILY_CANDLE_TTL_MS = 60 * 60 * 1000;
const INTRADAY_CANDLE_TTL_MS = 5 * 60 * 1000;

function isFresh(updatedAt: string, ttlMs: number): boolean {
  return Date.now() - new Date(updatedAt).getTime() < ttlMs;
}

export async function getQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  const uniqueSymbols = Array.from(new Set(symbols.map((s) => s.toUpperCase())));
  if (uniqueSymbols.length === 0) return {};

  const supabase = createServiceClient();
  const { data: cached } = await supabase
    .from("quote_cache")
    .select("*")
    .in("symbol", uniqueSymbols);

  const cacheBySymbol = new Map((cached ?? []).map((row) => [row.symbol, row]));
  const result: Record<string, Quote> = {};
  const staleSymbols: string[] = [];

  for (const symbol of uniqueSymbols) {
    const row = cacheBySymbol.get(symbol);
    if (row && isFresh(row.updated_at, QUOTE_TTL_MS)) {
      result[symbol] = rowToQuote(row);
    } else {
      staleSymbols.push(symbol);
    }
  }

  const CONCURRENCY = 5;
  for (let i = 0; i < staleSymbols.length; i += CONCURRENCY) {
    const batch = staleSymbols.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (symbol) => {
        try {
          const quote = await fetchFinnhub<FinnhubQuote>("/quote", { symbol });
          const nowIso = new Date().toISOString();
          const upsertRow = {
            symbol,
            price: quote.c,
            change: quote.d,
            percent_change: quote.dp,
            high: quote.h,
            low: quote.l,
            open: quote.o,
            prev_close: quote.pc,
            raw: quote,
            updated_at: nowIso,
          };
          await supabase.from("quote_cache").upsert(upsertRow);
          result[symbol] = rowToQuote(upsertRow);
        } catch {
          const stale = cacheBySymbol.get(symbol);
          if (stale) result[symbol] = rowToQuote(stale);
        }
      }),
    );
  }

  return result;
}

function rowToQuote(row: {
  symbol: string;
  price: number | null;
  change: number | null;
  percent_change: number | null;
  high: number | null;
  low: number | null;
  open: number | null;
  prev_close: number | null;
  updated_at: string;
}): Quote {
  return {
    symbol: row.symbol,
    price: row.price ?? 0,
    change: row.change,
    percentChange: row.percent_change,
    high: row.high ?? 0,
    low: row.low ?? 0,
    open: row.open ?? 0,
    prevClose: row.prev_close ?? 0,
    updatedAt: row.updated_at,
  };
}

export async function getProfile(symbol: string): Promise<StockProfile> {
  const upperSymbol = symbol.toUpperCase();
  const supabase = createServiceClient();
  const { data: row } = await supabase
    .from("stock_metadata_cache")
    .select("*")
    .eq("symbol", upperSymbol)
    .maybeSingle();

  if (row && isFresh(row.updated_at, PROFILE_TTL_MS)) {
    return rowToProfile(row);
  }

  try {
    const profile = await fetchFinnhub<FinnhubProfile>("/stock/profile2", {
      symbol: upperSymbol,
    });
    const upsertRow = {
      symbol: upperSymbol,
      company_name: profile.name ?? null,
      logo_url: profile.logo ?? null,
      exchange: profile.exchange ?? null,
      industry: profile.finnhubIndustry ?? null,
      currency: profile.currency ?? null,
      raw_profile: profile,
      updated_at: new Date().toISOString(),
    };
    await supabase.from("stock_metadata_cache").upsert(upsertRow);
    return rowToProfile(upsertRow);
  } catch {
    if (row) return rowToProfile(row);
    return {
      symbol: upperSymbol,
      companyName: null,
      logoUrl: null,
      exchange: null,
      industry: null,
      currency: null,
    };
  }
}

function rowToProfile(row: {
  symbol: string;
  company_name: string | null;
  logo_url: string | null;
  exchange: string | null;
  industry: string | null;
  currency: string | null;
}): StockProfile {
  return {
    symbol: row.symbol,
    companyName: row.company_name,
    logoUrl: row.logo_url,
    exchange: row.exchange,
    industry: row.industry,
    currency: row.currency,
  };
}

export async function getCandles(
  symbol: string,
  resolution: string,
  fromTs: number,
  toTs: number,
): Promise<CandlePoint[]> {
  const upperSymbol = symbol.toUpperCase();
  const ttl = resolution === "D" ? DAILY_CANDLE_TTL_MS : INTRADAY_CANDLE_TTL_MS;
  const supabase = createServiceClient();

  const { data: row } = await supabase
    .from("candle_cache")
    .select("*")
    .eq("symbol", upperSymbol)
    .eq("resolution", resolution)
    .eq("from_ts", fromTs)
    .eq("to_ts", toTs)
    .maybeSingle();

  if (row && isFresh(row.updated_at, ttl)) {
    return row.data as CandlePoint[];
  }

  try {
    const candles = await fetchFinnhub<FinnhubCandles>("/stock/candle", {
      symbol: upperSymbol,
      resolution,
      from: fromTs,
      to: toTs,
    });

    const points: CandlePoint[] =
      candles.s === "ok"
        ? candles.t.map((time, i) => ({
            time,
            open: candles.o[i],
            high: candles.h[i],
            low: candles.l[i],
            close: candles.c[i],
            volume: candles.v[i],
          }))
        : [];

    await supabase.from("candle_cache").upsert(
      {
        symbol: upperSymbol,
        resolution,
        from_ts: fromTs,
        to_ts: toTs,
        data: points,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "symbol,resolution,from_ts,to_ts" },
    );

    return points;
  } catch {
    if (row) return row.data as CandlePoint[];
    return [];
  }
}
