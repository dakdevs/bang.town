export const defaultBangs: Record<string, string> = {
  s: "chat.openai.com?model=gpt-4o&hints=search&q=%s",
  "4o": "chat.openai.com?model=gpt-4&q=%s",
  t3: "www.t3.chat/new?q=%s",
  w: "en.wikipedia.org/w/index.php?search=%s",
  yt: "www.youtube.com/results?search_query=%s",
  gh: "github.com/search?q=%s",
  so: "stackoverflow.com/search?q=%s",
  a: "www.amazon.com/s?k=%s",
  r: "www.reddit.com/search?q=%s",
  x: "x.com/search?q=%s",
  imdb: "www.imdb.com/find?q=%s",
  map: "www.google.com/maps?q=%s",
  g: "www.google.com/search?q=%s",
  ddg: "duckduckgo.com?q=%s",
  pp: "perplexity.ai?q=%s",
}

export function getBangName(key: string): string {
  const names: Record<string, string> = {
    s: "ChatGPT Search with GPT-4",
    "4o": "ChatGPT with GPT-4",
    t3: "T3 Chat",
    w: "Wikipedia",
    yt: "YouTube",
    gh: "GitHub",
    so: "Stack Overflow",
    a: "Amazon",
    r: "Reddit",
    x: "X (Twitter)",
    imdb: "IMDb",
    map: "Google Maps",
    g: "Google Search",
    ddg: "DuckDuckGo",
    pp: "Perplexity AI",
  }
  return names[key] || key
} 