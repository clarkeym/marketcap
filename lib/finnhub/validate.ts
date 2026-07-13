const SYMBOL_PATTERN = /^[A-Za-z0-9.\-]{1,15}$/;

export function isValidSymbol(symbol: string): boolean {
  return SYMBOL_PATTERN.test(symbol);
}

const MAX_SYMBOLS_PER_REQUEST = 25;

export function parseSymbolsParam(raw: string): string[] {
  const symbols = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .filter(isValidSymbol);

  return Array.from(new Set(symbols)).slice(0, MAX_SYMBOLS_PER_REQUEST);
}
