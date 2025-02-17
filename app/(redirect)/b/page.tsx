"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

// This makes the page client-side only rendered
export const dynamic = "force-dynamic"
export const runtime = "edge"

const defaultBangs: Record<string, string> = {
  g: "www.google.com/search?q=",
  w: "en.wikipedia.org/w/index.php?search=",
  c: "chat.openai.com/?q=",
  "4o": "chat.openai.com/?model=gpt-4&q=",
  yt: "www.youtube.com/results?search_query=",
  gh: "github.com/search?q=",
  so: "stackoverflow.com/search?q=",
  a: "www.amazon.com/s?k=",
  r: "www.reddit.com/search/?q=",
  x: "x.com/search?q=",
  imdb: "www.imdb.com/find?q=",
  map: "www.google.com/maps?q=",
  t3: "www.t3.chat/new?q=",
}

export default function BangRedirect() {
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle redirect after mount
  useEffect(() => {
    if (!isMounted) return

    const query = searchParams.get("q")
    if (!query) return

    const [bang, ...searchTerms] = query.split(" ")
    if (bang.startsWith("!")) {
      const bangKey = bang.slice(1)

      // Special case for settings bang
      if (bangKey === "settings") {
        // Get all custom bangs from the current URL
        const customBangs = new URLSearchParams()
        Array.from(searchParams.entries()).forEach(([key, value]) => {
          if (key !== "q") {
            customBangs.set(key, value)
          }
        })
        // Redirect to main page with custom bangs
        window.location.href = `/?${customBangs.toString()}`
        return
      }

      let bangUrl = searchParams.get(bangKey) || defaultBangs[bangKey]

      if (bangUrl) {
        if (!bangUrl.startsWith("http")) {
          bangUrl = `https://${bangUrl}`
        }
        window.location.href = `${bangUrl}${encodeURIComponent(searchTerms.join(" ")).replace(/%20/g, "+")}`
      } else {
        // If not found in custom or default bangs, use DuckDuckGo's bang
        window.location.href = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
      }
    } else {
      // If no bang is detected, use DuckDuckGo as the default search engine
      window.location.href = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
    }
  }, [isMounted, searchParams])

  // Show nothing while handling redirect
  return null
}
