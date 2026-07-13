export type FinnhubQuote = {
  c: number; // current price
  d: number | null; // change
  dp: number | null; // percent change
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // timestamp
};

export type FinnhubProfile = {
  name?: string;
  logo?: string;
  exchange?: string;
  finnhubIndustry?: string;
  currency?: string;
  ticker?: string;
};

export type FinnhubSearchResult = {
  count: number;
  result: {
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }[];
};

export type FinnhubCandles = {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  s: "ok" | "no_data";
  t: number[];
  v: number[];
};

export type Quote = {
  symbol: string;
  price: number;
  change: number | null;
  percentChange: number | null;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  updatedAt: string;
};

export type StockProfile = {
  symbol: string;
  companyName: string | null;
  logoUrl: string | null;
  exchange: string | null;
  industry: string | null;
  currency: string | null;
};

export type CandlePoint = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
