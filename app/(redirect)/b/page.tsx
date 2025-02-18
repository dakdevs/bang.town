"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { track } from "@vercel/analytics"
import { defaultBangs } from "../../lib/defaultBangs"

// This makes the page client-side only rendered
export const dynamic = "force-dynamic"
export const runtime = "edge"

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

    // If there are no search parameters at all, stay on /b/
    if (searchParams.size === 0) return

    const query = searchParams.get("q")
    // If there are parameters but no q parameter, stay on /b/
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

      // Try to find the bang URL in custom bangs first, then built-in bangs
      let bangUrl = searchParams.get(bangKey) || defaultBangs[bangKey]

      if (bangUrl) {
        // Bang found, use it for the search
        if (!bangUrl.startsWith("http")) {
          bangUrl = `https://${bangUrl}`
        }
        const finalUrl = bangUrl.replace("%s", encodeURIComponent(searchTerms.join(" ")).replace(/%20/g, "+"))
        track("bang_redirect", {
          bang: bangKey,
          url_template: bangUrl,
          hasSearchTerms: searchTerms.length > 0
        })
        window.location.href = finalUrl
      } else {
        // Bang not found, fallback to DuckDuckGo's bang system
        const ddgUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
        track("bang_redirect", {
          bang: bangKey,
          url_template: "https://duckduckgo.com/?q=%s",
          type: "duckduckgo_fallback"
        })
        window.location.href = ddgUrl
      }
    } else {
      // No bang prefix, use the default search engine
      const defaultBang = searchParams.get('default') || 'ddg'
      let bangUrl = searchParams.get(defaultBang) || defaultBangs[defaultBang]

      if (!bangUrl) {
        // Default bang not found, fallback to DuckDuckGo
        const ddgUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
        track("bang_redirect", {
          url_template: "https://duckduckgo.com/?q=%s",
          type: "default_search_fallback"
        })
        window.location.href = ddgUrl
        return
      }

      // Use the default search engine
      if (!bangUrl.startsWith("http")) {
        bangUrl = `https://${bangUrl}`
      }
      const finalUrl = bangUrl.replace("%s", encodeURIComponent(query).replace(/%20/g, "+"))
      track("bang_redirect", {
        bang: defaultBang,
        url_template: bangUrl,
        type: "default_search"
      })
      window.location.href = finalUrl
    }
  }, [isMounted, searchParams])

  // Show nothing while handling redirect
  return null
}
