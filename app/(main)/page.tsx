"use client"

import { useState, useEffect, useMemo, Suspense, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Toaster, toast } from "sonner"
import Link from "next/link"
import { track } from "@vercel/analytics"
import { ImportBangModal, ConfirmDialog } from "../components/ImportBangModal"
import { defaultBangs, getBangName } from "../lib/defaultBangs"

function generateBangCode(key: string, url: string) {
  return btoa(`${key}|${url}`)
}

function decodeBangCode(code: string) {
  try {
    // First try to parse as raw key|url format
    if (code.includes('|')) {
      const [key, url] = code.split('|', 2)
      if (!key || !url) {
        throw new Error('Invalid bang configuration')
      }
      return { key, url }
    }

    // If not raw format, try base64 decode
    const decoded = atob(code)
    const [key, url] = decoded.split('|', 2)
    if (!key || !url) {
      throw new Error('Invalid bang configuration')
    }
    return { key, url }
  } catch (error) {
    return null
  }
}

function generateYouTubeChannelSearchUrl(username: string) {
  // Remove @ if it was included
  username = username.replace(/^@/, '')
  return `www.youtube.com/@${username}/search?query=%s`
}

function generateTwitterSearchUrl(username: string) {
  // Remove @ if it was included
  username = username.replace(/^@/, '')
  return `x.com/search?q=from%3A${username}%20%s`
}

function generateVercelLogsUrl(teamSlug: string, projectSlug: string, levels: string) {
  // The %s will be automatically replaced with the search query, with spaces converted to +
  return `vercel.com/${teamSlug}/${projectSlug}/logs?levels=${levels}&searchQuery=%s`
}

// Function to transform search query for Vercel logs
function transformVercelSearchQuery(query: string) {
  return query.replace(/ /g, '+')
}

function HomeContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [newBangKey, setNewBangKey] = useState("")
  const [newBangUrl, setNewBangUrl] = useState("")
  const [fullUrl, setFullUrl] = useState("")
  const [shareUrl, setShareUrl] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ key: string } | null>(null)
  const [initialUrl, setInitialUrl] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [initialParams, setInitialParams] = useState<string>("")
  const [editingBang, setEditingBang] = useState<{ originalKey: string, key: string, url: string } | null>(null)
  const [isYouTubeMode, setIsYouTubeMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'custom' | 'youtube' | 'tweets' | 'vercel' | 'more'>('custom')
  const [vercelLevels, setVercelLevels] = useState<{ error: boolean, warning: boolean }>({ error: true, warning: false })

  console.log('editingBang', editingBang)

  // Get default bang from URL params
  const defaultBang = searchParams.get('_d') || 'ddg'
  const isDefaultBang = (key: string, isCustomBang: boolean = false) => {
    const defaultBang = searchParams.get('_d')
    const isBuiltIn = searchParams.get('_b') === 't' || !defaultBang

    if (isBuiltIn && isCustomBang) return false

    if (isBuiltIn && (defaultBang === key || !defaultBang && key === 'ddg')) return true

    if (isCustomBang && defaultBang === key) return true

    return false
  }

  // Function to get browser search settings URL
  const getBrowserSettingsUrl = () => {
    const userAgent = window.navigator.userAgent.toLowerCase()

    if (userAgent.includes('chrome')) {
      return 'chrome://settings/searchEngines'
    } else if (userAgent.includes('firefox')) {
      return 'about:preferences#search'
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'safari://settings/search'
    } else if (userAgent.includes('edg')) {
      return 'edge://settings/searchEngines'
    } else if (userAgent.includes('opera')) {
      return 'opera://settings/searchEngines'
    }
    return null
  }

  // Get browser name for display
  const getBrowserName = () => {
    const userAgent = window.navigator.userAgent.toLowerCase()

    if (userAgent.includes('chrome')) {
      return 'Chrome'
    } else if (userAgent.includes('firefox')) {
      return 'Firefox'
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'Safari'
    } else if (userAgent.includes('edg')) {
      return 'Edge'
    } else if (userAgent.includes('opera')) {
      return 'Opera'
    }
    return 'browser'
  }

  // Track initial URL and params on first load
  useEffect(() => {
    const currentUrl = window.location.origin
    const params = new URLSearchParams(searchParams.toString())
    const urlParams = params.toString().replace(/&?_q=[^&]*/, "")
    const initialFullUrl = `${currentUrl}/b?${urlParams}${urlParams ? '&' : ''}_q=%s`
    const initialLegacyUrl = `${currentUrl}/b?${urlParams}${urlParams ? '&' : ''}_q=%s`
    setInitialUrl(initialFullUrl)
    setInitialParams(urlParams)

    // Show legacy URL notice if using old format
    if (pathname.startsWith('/b')) {
      toast.message(
        "Legacy URL Format",
        {
          id: "legacy-url",
          description: "You're using the legacy URL format. The shorter format is now recommended, but both will continue to work.",
          duration: 5000,
          className: "bg-surface text-text-light border border-primary-light"
        }
      )
    }
  }, []) // Empty dependency array means this only runs once on mount

  // Update fullUrl and check for changes
  useEffect(() => {
    const currentUrl = window.location.origin
    const params = new URLSearchParams(searchParams.toString())

    // Remove q parameter if it exists and add placeholder
    const urlParams = params.toString().replace(/&?_q=[^&]*/, "")
    const currentFullUrl = `${currentUrl}/b?${urlParams}${urlParams ? '&' : ''}_q=%s`
    const currentLegacyUrl = `${currentUrl}/b?${urlParams}${urlParams ? '&' : ''}_q=%s`
    setFullUrl(pathname.startsWith('/b') ? currentLegacyUrl : currentFullUrl)

    // For Vercel logs URLs, transform the search query
    const searchQuery = params.get('_q')
    if (searchQuery && searchQuery.startsWith('!')) {
      const [bangKey] = searchQuery.slice(1).split(' ', 1)
      const bangUrl = params.get(bangKey)
      if (bangUrl && bangUrl.startsWith('vercel.com') && bangUrl.includes('/logs?')) {
        const query = searchQuery.slice(bangKey.length + 2) // +2 for '!' and space
        if (query) {
          const transformedQuery = transformVercelSearchQuery(query)
          const updatedParams = new URLSearchParams(params.toString())
          updatedParams.set('_q', `!${bangKey} ${transformedQuery}`)
          router.replace(`/?${updatedParams.toString()}`, { scroll: false })
        }
      }
    }

    // Check for changes only if initialUrl has been set
    if (initialUrl) {
      const hasChanges = currentFullUrl !== initialUrl
      setHasUnsavedChanges(hasChanges)

      // Show or dismiss the persistent toast based on changes
      if (hasChanges) {
        const browserSettingsUrl = getBrowserSettingsUrl()

        toast.message(
          "Unsaved Changes",
          {
            id: "unsaved-changes",
            duration: Infinity,
            description: (
              <div className="text-sm">
                <strong>Make sure to update your search settings</strong> in {getBrowserName()} to save your changes.
                {!browserSettingsUrl && (
                  <>
                    {" "}Check our{" "}
                    <Link
                      href="/instructions"
                      className="text-primary hover:text-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                      setup instructions
                    </Link>
                    {" "}for help.
                  </>
                )}
              </div>
            ),
            dismissible: false,
            className: "bg-surface text-text-light border border-primary-light"
          }
        )
      } else {
        toast.dismiss("unsaved-changes")
      }
    }

    // Generate share URL that redirects to settings with current bangs
    const customBangs = new URLSearchParams()
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (key !== "_q") {
        customBangs.set(key, value)
      }
    })
    const customBangsStr = customBangs.toString()
    setShareUrl(`${currentUrl}${pathname.startsWith('/b') ? '/b' : ''}/b?${customBangsStr}${customBangsStr ? '&' : ''}_q=!settings`)
  }, [searchParams, initialUrl])

  // Get custom bangs
  const customBangs = useMemo(() => {
    return Array.from(searchParams.entries())
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, url]) => ({
        key,
        url,
        isNew: initialParams && !initialParams.includes(key)
      }))
  }, [searchParams, initialParams])

  const handleAddBang = () => {
    if (newBangKey && newBangUrl) {
      const cleanedUrl = newBangUrl.replace(/^(https?:\/\/)/, "")
      const currentDomain = typeof window !== "undefined" ? window.location.hostname : ""
      const bangDomain = new URL(`https://${cleanedUrl}`).hostname

      // Check if trying to add current domain
      if (bangDomain === currentDomain) {
        toast.error(
          "Nice try! But adding a bang for the current domain would create an infinite loop. 🌀",
          {
            description: "We don't want to break the space-time continuum, do we? 🚀",
            className: "bg-red-500 text-white border-red-600"
          }
        )
        return
      }

      // For Vercel logs URLs, we'll handle space conversion in the search query
      if (cleanedUrl.startsWith('vercel.com') && cleanedUrl.includes('/logs?')) {
        const searchPlaceholder = '%s'
        if (!cleanedUrl.includes(searchPlaceholder)) {
          toast.error(
            "Missing search term placeholder!",
            {
              description: "The URL must contain %s where the search term should be inserted",
              className: "bg-red-500 text-white border-red-600"
            }
          )
          return
        }
      } else {
        // For other URLs, check if URL contains %s placeholder
        if (!cleanedUrl.includes("%s")) {
          toast.error(
            "Missing search term placeholder!",
            {
              description: "The URL must contain %s where the search term should be inserted (e.g., example.com/search?q=%s)",
              className: "bg-red-500 text-white border-red-600"
            }
          )
          return
        }
      }

      // Check for exact duplicate (same key AND same URL)
      const existingCustomUrl = searchParams.get(newBangKey)
      const existingDefaultUrl = defaultBangs[newBangKey]?.replace(/^(https?:\/\/)/, "")

      if ((existingCustomUrl && existingCustomUrl === cleanedUrl) ||
        (existingDefaultUrl && existingDefaultUrl === cleanedUrl)) {
        toast.error(
          `The bang !${newBangKey} with this URL already exists!`,
          {
            description: existingDefaultUrl === cleanedUrl
              ? "This exact bang is already available as a built-in bang."
              : "You already have this exact custom bang.",
            className: "bg-red-500 text-white border-red-600"
          }
        )
        return
      }

      // If key exists in custom bangs, show error
      if (searchParams.has(newBangKey)) {
        toast.error(
          `The bang !${newBangKey} already exists!`,
          {
            description: "You already have a custom bang with this key.",
            className: "bg-red-500 text-white border-red-600"
          }
        )
        return
      }

      // Track custom bang creation
      track("custom_bang_created", {
        key: newBangKey,
        domain: bangDomain,
        template: cleanedUrl,
        overrides_builtin: defaultBangs[newBangKey] ? true : false
      })

      // If overriding a built-in bang, show warning toast
      if (defaultBangs[newBangKey]) {
        toast.warning(
          `Overriding built-in bang !${newBangKey}`,
          {
            description: "Your custom bang will take precedence over the built-in bang.",
            className: "bg-yellow-500 text-white border-yellow-600"
          }
        )
      }

      const updatedSearchParams = new URLSearchParams(searchParams.toString())
      updatedSearchParams.set(newBangKey, cleanedUrl)
      router.push(`/?${updatedSearchParams.toString()}`)
      setNewBangKey("")
      setNewBangUrl("")

      toast.success(
        `Added !${newBangKey} bang!`,
        {
          description: `You can now use !${newBangKey} to search ${bangDomain} 🎉`,
          className: "bg-primary text-white border-primary"
        }
      )
    }
  }

  const handleDeleteBang = (key: string) => {
    setDeleteConfirmation({ key })
  }

  const confirmDelete = () => {
    if (!deleteConfirmation) return

    const updatedSearchParams = new URLSearchParams(searchParams.toString())
    updatedSearchParams.delete(deleteConfirmation.key)
    router.push(`/?${updatedSearchParams.toString()}`)
    setDeleteConfirmation(null)
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      track("settings_url_shared", {
        num_custom_bangs: customBangs.length,
        default_bang: defaultBang
      })
      toast.success(
        "Settings URL copied!",
        {
          description: "Share this URL with others to let them import all your custom bangs at once.",
          className: "bg-primary text-white border-primary"
        }
      )
    } catch (error) {
      toast.error("Failed to copy URL", {
        className: "bg-red-500 text-white border-red-600"
      })
    }
  }

  const handleShareBang = (key: string, url: string) => {
    const cleanUrl = url.replace(/^(https?:\/\/)/, "")
    const shareText = `${key}|${cleanUrl}`
    navigator.clipboard.writeText(shareText)
    track("custom_bang_shared", {
      key,
      domain: new URL(`https://${cleanUrl}`).hostname,
      template: cleanUrl,
      is_default: key === defaultBang
    })
    toast.success(
      "Bang code copied!",
      {
        description: "Share this code with others so they can import your bang configuration.",
        className: "bg-primary text-white border-primary"
      }
    )
  }

  // Filter bangs based on search query
  const filteredBangs = useMemo(() => {
    if (!searchQuery) return customBangs
    const query = searchQuery.toLowerCase()
    return customBangs.filter(
      ({ key, url }) =>
        key.toLowerCase().includes(query) ||
        url.toLowerCase().includes(query)
    )
  }, [customBangs, searchQuery])

  return (
    <div>
      <Toaster
        position="top-right"
        dir="auto"
        expand={true}
        richColors
      />
      <div className="mb-4 sm:mb-6" role="region" aria-labelledby="custom-search-url-heading">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-2">
          <h2 id="custom-search-url-heading" className="text-xl sm:text-2xl text-primary m-0">Your Custom Search URL</h2>
          <div className="flex gap-2 shrink-0" role="group" aria-label="URL sharing options">
            <button
              onClick={() => {
                navigator.clipboard.writeText(fullUrl)
                track("custom_url_copied", {
                  url: fullUrl,
                  num_custom_bangs: customBangs.length,
                  default_bang: defaultBang
                })
                toast.success(
                  "URL copied!",
                  {
                    description: "Your custom search URL has been copied to your clipboard.",
                    className: "bg-primary text-white border-primary"
                  }
                )
              }}
              aria-label="Copy custom search URL to clipboard"
              className="bg-primary text-white px-3 py-1.5 rounded text-sm hover:bg-primary-dark transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-offset-2 flex items-center justify-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </button>
            <button
              onClick={handleShare}
              aria-label="Share settings URL"
              className="bg-surface text-primary border border-primary px-3 py-1.5 rounded text-sm hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            id="custom-search-url"
            type="text"
            value={fullUrl}
            readOnly
            aria-label="Your custom search URL"
            className="w-full bg-surface p-2 rounded text-sm h-9 font-mono focus:outline-none focus:ring-2 focus:ring-primary overflow-x-auto border border-primary-light/20"
            onClick={(e) => e.currentTarget.select()}
          />
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-text-light">
          <span className="bg-accent px-1.5 py-0.5 rounded">Pro tip:</span>
          Use <code className="bg-surface px-1 rounded">!settings</code> to return here
          <span className="text-text-light/50">·</span>
          <a href="/instructions" className="text-primary hover:text-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">Setup guide</a>
        </div>
      </div>

      <div className="mb-4 sm:mb-6" role="region" aria-labelledby="add-bang-heading">
        <h2 id="add-bang-heading" className="text-xl sm:text-2xl mb-3 sm:mb-4 text-primary">Add Custom Bang</h2>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap text-sm ${activeTab === 'custom'
              ? "bg-primary text-white"
              : "bg-white text-primary hover:bg-primary hover:text-white"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Custom Bang
          </button>
          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap text-sm ${activeTab === 'youtube'
              ? "bg-primary text-white"
              : "bg-white text-primary hover:bg-primary hover:text-white"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
            YouTube Channel
          </button>
          <button
            onClick={() => setActiveTab('tweets')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap text-sm ${activeTab === 'tweets'
              ? "bg-primary text-white"
              : "bg-white text-primary hover:bg-primary hover:text-white"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Tweets
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap text-sm ${activeTab === 'vercel'
              ? "bg-primary text-white"
              : "bg-white text-primary hover:bg-primary hover:text-white"
              }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 22.525H0l12-21.05 12 21.05z" />
            </svg>
            Vercel Logs
          </button>
          <button
            onClick={() => setActiveTab('more')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap text-sm bg-[#FFD7CC] text-primary opacity-50 cursor-not-allowed`}
            disabled
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            More Coming Soon
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-surface p-4 rounded-lg border border-primary-light/20">
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <p className="text-text-light text-sm">
                Create a custom bang by specifying a key and URL pattern. Use <code className="bg-accent px-1 rounded">%s</code> in the URL where you want the search term to appear.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative w-full sm:w-1/4">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-text-light" aria-hidden="true">!</span>
                    <input
                      type="text"
                      value={newBangKey}
                      onChange={(e) => setNewBangKey(e.target.value)}
                      placeholder="g"
                      aria-label="Bang key"
                      className="w-full border border-primary-light pl-6 pr-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div className="relative flex-grow">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-text-light whitespace-nowrap" aria-hidden="true">https://</span>
                    <input
                      id="bang-url-input"
                      type="text"
                      value={newBangUrl}
                      onChange={(e) => setNewBangUrl(e.target.value.replace(/^(https?:\/\/)/, ""))}
                      onPaste={(e) => {
                        e.preventDefault()
                        const pastedText = e.clipboardData.getData("text")
                        setNewBangUrl(pastedText.replace(/^(https?:\/\/)/, ""))
                      }}
                      placeholder="www.google.com/search?q=%s"
                      aria-label="Bang URL"
                      className="w-full border border-primary-light pl-[4.5rem] pr-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddBang}
                  aria-label="Add custom bang"
                  className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add Bang
                </button>
              </div>
            </div>
          )}

          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <p className="text-text-light text-sm">
                Create a bang to search within a specific YouTube channel. Just enter the channel's username (with or without @) and a bang key.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative w-full sm:w-1/4">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-text-light" aria-hidden="true">!</span>
                    <input
                      type="text"
                      value={newBangKey}
                      onChange={(e) => setNewBangKey(e.target.value)}
                      placeholder="mkbhd"
                      aria-label="Bang key"
                      className="w-full border border-primary-light pl-6 pr-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div className="relative flex-grow">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light/50" aria-hidden="true">@</span>
                    <input
                      id="youtube-username-input"
                      type="text"
                      value={newBangUrl}
                      onChange={(e) => {
                        const username = e.target.value.replace(/^@/, '')
                        setNewBangUrl(username)
                      }}
                      placeholder="MKBHD"
                      aria-label="YouTube username"
                      className="w-full border border-primary-light pl-8 pr-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-light/50 uppercase"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (newBangKey && newBangUrl) {
                      const url = generateYouTubeChannelSearchUrl(newBangUrl)
                      const updatedSearchParams = new URLSearchParams(searchParams.toString())
                      updatedSearchParams.set(newBangKey, url)
                      router.push(`/?${updatedSearchParams.toString()}`)
                      setNewBangKey("")
                      setNewBangUrl("")
                    }
                  }}
                  aria-label="Add YouTube channel search bang"
                  className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add Bang
                </button>
              </div>
              <div className="text-text-light bg-accent p-4 rounded">
                <strong>Example:</strong> Adding <code className="bg-surface px-2 py-0.5 rounded">!mkbhd</code> with username <code className="bg-surface px-2 py-0.5 rounded">@mkbhd</code> will let you search within MKBHD's channel using <code className="bg-surface px-2 py-0.5 rounded">!mkbhd tech reviews</code>
              </div>
            </div>
          )}

          {activeTab === 'tweets' && (
            <div className="space-y-4">
              <p className="text-text-light text-sm">
                Create a bang to search tweets from a specific user. Just enter the user's handle (with or without @) and a bang key.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative w-full sm:w-1/4">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-text-light" aria-hidden="true">!</span>
                    <input
                      type="text"
                      value={newBangKey}
                      onChange={(e) => setNewBangKey(e.target.value)}
                      placeholder="g"
                      aria-label="Bang key"
                      className="w-full border border-primary-light pl-6 pr-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div className="relative flex-grow">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light/50" aria-hidden="true">@</span>
                    <input
                      id="twitter-username-input"
                      type="text"
                      value={newBangUrl}
                      onChange={(e) => {
                        const username = e.target.value.replace(/^@/, '')
                        setNewBangUrl(username)
                      }}
                      placeholder="RAUCHG"
                      aria-label="Twitter username"
                      className="w-full border border-primary-light pl-8 pr-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-light/50 uppercase"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (newBangKey && newBangUrl) {
                      const url = generateTwitterSearchUrl(newBangUrl)
                      const updatedSearchParams = new URLSearchParams(searchParams.toString())
                      updatedSearchParams.set(newBangKey, url)
                      router.push(`/?${updatedSearchParams.toString()}`)
                      setNewBangKey("")
                      setNewBangUrl("")
                    }
                  }}
                  aria-label="Add Twitter user search bang"
                  className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add Bang
                </button>
              </div>
              <div className="text-text-light bg-accent p-4 rounded">
                <strong>Example:</strong> Adding <code className="bg-surface px-2 py-0.5 rounded">!g</code> with username <code className="bg-surface px-2 py-0.5 rounded">@rauchg</code> will let you search G's tweets using <code className="bg-surface px-2 py-0.5 rounded">!g AI</code>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <p className="text-text-light text-sm">
                Create a bang to search Vercel logs for a specific project. Enter your team and project slugs, and choose which log levels to include.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative w-full sm:w-1/4">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-text-light" aria-hidden="true">!</span>
                    <input
                      type="text"
                      value={newBangKey}
                      onChange={(e) => setNewBangKey(e.target.value)}
                      placeholder="vl"
                      aria-label="Bang key"
                      className="w-full border border-primary-light pl-6 pr-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div className="relative flex-1">
                    <input
                      id="vercel-team-input"
                      type="text"
                      value={newBangUrl}
                      onChange={(e) => setNewBangUrl(e.target.value)}
                      placeholder="TEAM SLUG"
                      aria-label="Vercel team slug"
                      className="w-full border border-primary-light px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-light/50 uppercase"
                    />
                  </div>
                  <div className="relative flex-1">
                    <input
                      id="vercel-project-input"
                      type="text"
                      placeholder="PROJECT SLUG"
                      aria-label="Vercel project slug"
                      className="w-full border border-primary-light px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-light/50 uppercase"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <label className="flex items-center gap-2 text-sm text-text-light">
                    <input
                      type="checkbox"
                      checked={vercelLevels.error}
                      onChange={(e) => setVercelLevels(prev => ({ ...prev, error: e.target.checked }))}
                      className="rounded border-primary-light text-primary focus:ring-primary"
                    />
                    Error
                  </label>
                  <label className="flex items-center gap-2 text-sm text-text-light">
                    <input
                      type="checkbox"
                      checked={vercelLevels.warning}
                      onChange={(e) => setVercelLevels(prev => ({ ...prev, warning: e.target.checked }))}
                      className="rounded border-primary-light text-primary focus:ring-primary"
                    />
                    Warning
                  </label>
                </div>
                <button
                  onClick={() => {
                    if (newBangKey && newBangUrl) {
                      const teamSlug = newBangUrl
                      const projectSlug = (document.getElementById('vercel-project-input') as HTMLInputElement)?.value
                      const levels = [
                        vercelLevels.error && 'error',
                        vercelLevels.warning && 'warning'
                      ].filter(Boolean).join('%2C')
                      const url = generateVercelLogsUrl(teamSlug, projectSlug, levels)
                      const updatedSearchParams = new URLSearchParams(searchParams.toString())
                      updatedSearchParams.set(newBangKey, url)
                      router.push(`/?${updatedSearchParams.toString()}`)
                      setNewBangKey("")
                      setNewBangUrl("")
                      // Reset project slug input
                      const projectInput = document.getElementById('vercel-project-input') as HTMLInputElement
                      if (projectInput) {
                        projectInput.value = ""
                      }
                      setVercelLevels({ error: true, warning: false })
                    }
                  }}
                  aria-label="Add Vercel logs search bang"
                  className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add Bang
                </button>
              </div>
              <div className="text-text-light bg-accent p-4 rounded">
                <strong>Example:</strong> Adding <code className="bg-surface px-2 py-0.5 rounded">!vl</code> with team <code className="bg-surface px-2 py-0.5 rounded">team-slug</code> and project <code className="bg-surface px-2 py-0.5 rounded">project-name</code> will let you search logs using <code className="bg-surface px-2 py-0.5 rounded">!vl api error</code>
              </div>
            </div>
          )}

          {activeTab === 'more' && (
            <div className="text-center py-8">
              <p className="text-text-light">More preset options coming soon!</p>
              <p className="text-sm text-text-light mt-2">Have a suggestion? Let us know on <a href="https://x.com/dakdevs" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">X/Twitter</a>.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 sm:mb-6" role="region" aria-labelledby="custom-bangs-heading">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 mb-3 sm:mb-4 bg-gradient-to-r from-primary to-primary-light text-white p-4 rounded-lg">
          <h2 id="custom-bangs-heading" className="text-xl sm:text-2xl text-white m-0">Custom Bangs</h2>
          <button
            onClick={() => setIsImportModalOpen(true)}
            aria-label="Import bang configuration"
            className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import Bang
          </button>
        </div>

        {customBangs.length > 0 ? (
          <>
            {customBangs.length > 10 && (
              <div className="mb-4">
                <div className="relative">
                  <svg
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    id="search-bangs-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search custom bangs..."
                    aria-label="Search custom bangs"
                    className="w-full h-10 pl-8 pr-4 border border-primary-light rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <p className="mt-2 text-sm text-text-light" role="status">
                  Showing {filteredBangs.length} of {customBangs.length} bangs
                </p>
              </div>
            )}
            <ul className="space-y-3" role="list" aria-label="Custom bangs list">
              {filteredBangs
                .sort((a, b) => {
                  const aIsNew = a.isNew
                  const bIsNew = b.isNew
                  if (aIsNew && !bIsNew) return -1
                  if (!aIsNew && bIsNew) return 1
                  return 0
                })
                .map(({ key, url, isNew }) => {
                  const isDefault = isDefaultBang(key, true)
                  const isEditing = editingBang?.originalKey === key

                  if (isEditing) {
                    return (
                      <li key={key} className={`${isDefault ? "bg-primary bg-opacity-5" : "bg-surface"} rounded-lg p-4 flex flex-col gap-3 border border-primary-light/10 hover:border-primary-light/30 transition-colors`} role="listitem">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative w-full sm:w-1/4">
                              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-text-light" aria-hidden="true">!</span>
                              <input
                                type="text"
                                value={editingBang.key}
                                onChange={(e) => setEditingBang({ ...editingBang, key: e.target.value })}
                                placeholder="g"
                                aria-label="Bang key"
                                className="w-full border border-primary-light pl-6 pr-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div className="relative flex-grow">
                              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-text-light whitespace-nowrap" aria-hidden="true">https://</span>
                              <input
                                type="text"
                                value={editingBang.url}
                                onChange={(e) => setEditingBang({ ...editingBang, url: e.target.value.replace(/^(https?:\/\/)/, "") })}
                                onPaste={(e) => {
                                  e.preventDefault()
                                  const pastedText = e.clipboardData.getData("text")
                                  setEditingBang({ ...editingBang, url: pastedText.replace(/^(https?:\/\/)/, "") })
                                }}
                                placeholder="www.google.com/search?q=%s"
                                aria-label="Bang URL"
                                className="w-full border border-primary-light pl-[4.5rem] pr-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                // Validate URL contains %s
                                if (!editingBang.url.includes("%s")) {
                                  toast.error(
                                    "Missing search term placeholder!",
                                    {
                                      description: "The URL must contain %s where the search term should be inserted (e.g., example.com/search?q=%s)",
                                      className: "bg-red-500 text-white border-red-600"
                                    }
                                  )
                                  return
                                }

                                // Check for duplicates (excluding the current bang being edited)
                                const isDuplicateKey = Array.from(searchParams.entries())
                                  .some(([k, v]) => k !== editingBang.originalKey && k === editingBang.key)

                                const isDuplicateUrl = Array.from(searchParams.entries())
                                  .some(([k, v]) => k !== editingBang.originalKey && v === editingBang.url)

                                const isBuiltInDuplicate = defaultBangs[editingBang.key] === editingBang.url

                                if ((isDuplicateKey && isDuplicateUrl) || isBuiltInDuplicate) {
                                  toast.error(
                                    `The bang !${editingBang.key} with this URL already exists!`,
                                    {
                                      description: isBuiltInDuplicate
                                        ? "This exact bang is already available as a built-in bang."
                                        : "You already have this exact custom bang.",
                                      className: "bg-red-500 text-white border-red-600"
                                    }
                                  )
                                  return
                                }

                                // If only the key exists (but with a different URL), show warning
                                if (isDuplicateKey || defaultBangs[editingBang.key]) {
                                  toast.error(
                                    `The bang !${editingBang.key} already exists!`,
                                    {
                                      description: defaultBangs[editingBang.key]
                                        ? "This is a built-in bang - try a different key."
                                        : "You already have a custom bang with this key.",
                                      className: "bg-red-500 text-white border-red-600"
                                    }
                                  )
                                  return
                                }

                                const updatedSearchParams = new URLSearchParams(searchParams.toString())
                                // Remove the old bang
                                updatedSearchParams.delete(editingBang.originalKey)
                                // Add the new bang
                                updatedSearchParams.set(editingBang.key, editingBang.url)
                                router.push(`/?${updatedSearchParams.toString()}`)
                                setEditingBang(null)
                                toast.success(
                                  "Bang updated!",
                                  {
                                    description: editingBang.originalKey !== editingBang.key
                                      ? `The bang has been updated from !${editingBang.originalKey} to !${editingBang.key}`
                                      : `The URL for !${editingBang.key} has been updated.`,
                                    className: "bg-primary text-white border-primary"
                                  }
                                )
                              }}
                              className="text-sm px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary-dark transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-1.5"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                              </svg>
                              Save Changes
                            </button>
                            <button
                              onClick={() => setEditingBang(null)}
                              className="text-sm px-3 py-1.5 rounded-md bg-surface text-primary border border-primary hover:bg-primary hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-1.5"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  }

                  return (
                    <li key={key} className={`${isDefault ? "bg-primary bg-opacity-5" : "bg-surface"} rounded-lg p-4 flex flex-col gap-3 border border-primary-light/10 hover:border-primary-light/30 transition-colors`} role="listitem">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 w-full">
                          <div className="relative shrink-0">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-text-light" aria-hidden="true">!</span>
                            <input
                              type="text"
                              value={key}
                              readOnly
                              className="bg-surface border-primary-light/20 pl-6 pr-2 py-1.5 rounded-md font-mono text-sm border font-medium w-[5rem] text-center text-primary"
                            />
                          </div>
                          <span className="text-text-light/50 select-none shrink-0">→</span>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={`https://${url}`}
                              readOnly
                              className={`${isDefault ? "bg-primary bg-opacity-5" : "bg-surface"} px-3 py-1.5 rounded-md font-mono text-sm border border-primary-light/20 flex-1 overflow-x-auto focus:outline-none focus:ring-2 focus:ring-primary text-text`}
                              onClick={(e) => e.currentTarget.select()}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingBang({ originalKey: key, key, url })}
                          className="text-sm px-3 py-1.5 rounded-md bg-surface text-primary border border-primary hover:bg-primary hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-1.5"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const updatedSearchParams = new URLSearchParams(searchParams.toString())
                            updatedSearchParams.delete('_b')
                            if (key === 'ddg') {
                              updatedSearchParams.delete('_d')
                            } else {
                              updatedSearchParams.set('_d', key)
                            }
                            router.push(`/?${updatedSearchParams.toString()}`, { scroll: false })
                            toast.success(
                              "Default bang updated!",
                              {
                                description: `Searches without a bang will now use !${key}`,
                                className: "bg-primary text-white border-primary"
                              }
                            )
                          }}
                          disabled={isDefault}
                          className={`text-sm px-3 py-1.5 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-1.5 ${isDefault
                            ? "bg-surface text-primary/40 border border-primary/40 cursor-not-allowed opacity-50 hover:bg-surface hover:text-primary/40"
                            : "bg-surface text-primary border border-primary hover:bg-primary hover:text-white focus:ring-primary"
                            }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                          {isDefault ? "Default" : "Set Default"}
                        </button>
                        <button
                          onClick={() => handleShareBang(key, url)}
                          className="text-sm px-3 py-1.5 rounded-md bg-surface text-primary border border-primary hover:bg-primary hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-1.5"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                          </svg>
                          Share
                        </button>
                        <button
                          onClick={() => handleDeleteBang(key)}
                          className="text-sm px-3 py-1.5 rounded-md bg-surface text-red-500 border border-red-500 hover:bg-red-500 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center gap-1.5"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </li>
                  )
                })}
            </ul>
          </>
        ) : (
          <div className="text-center p-4 bg-surface rounded-lg" role="status">
            <p className="text-text-light mb-2">You haven't added any custom bangs yet.</p>
            <p className="text-primary">Add your first custom bang above to get started!</p>
          </div>
        )}
      </div>

      <div role="region" aria-labelledby="default-bangs-heading">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 mb-3 sm:mb-4 bg-gradient-to-r from-primary-dark to-primary text-white p-4 rounded-lg">
          <h2 id="builtin-bangs-heading" className="text-xl sm:text-2xl text-white m-0">Built-in Bangs</h2>
          <p className="text-sm text-text-light">These are the built-in bangs that come with bang.town</p>
        </div>
        <ul className="space-y-2" role="list" aria-label="Built-in bangs list">
          {Object.entries(defaultBangs).map(([key, url]) => {
            const isOverridden = searchParams.has(key)
            const name = getBangName(key)
            const isDefault = isDefaultBang(key)
            return (
              <li key={key} className={`${isOverridden ? "opacity-75" : ""} ${isDefault ? "bg-blue-50" : "bg-white"} border ${isDefault ? "border-blue-200" : "border-gray-100"} rounded-lg p-2 flex flex-wrap items-center gap-2`} role="listitem" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 min-w-[200px]">
                  <code className={`${isOverridden ? "line-through" : ""} ${isDefault ? "bg-blue-100 border-blue-200 text-blue-800" : "bg-blue-50 border-blue-100 text-blue-700"} px-2 py-1 rounded-md font-mono text-sm border font-medium min-w-[3rem] text-center`}>
                    !{key}
                  </code>
                  <span className="text-gray-300 select-none">→</span>
                  <span className={`${isOverridden ? "line-through" : ""} ${isDefault ? "text-blue-800" : "text-primary"} font-medium`}>
                    {name}
                  </span>
                </div>
                {(isOverridden || isDefault) && (
                  <div className="flex gap-1">
                    {isOverridden && (
                      <span className="text-red-500 text-xs font-medium px-2 py-1 bg-red-50 rounded-md border border-red-100" role="status">
                        Overridden
                      </span>
                    )}
                    {isDefault && (
                      <span className="text-blue-600 text-xs font-medium px-2 py-1 bg-blue-50 rounded-md border border-blue-200" role="status">
                        Default
                      </span>
                    )}
                  </div>
                )}
                <div className="flex-1 flex items-center gap-2 min-w-[300px]">
                  <input
                    type="text"
                    value={`https://${url}`}
                    readOnly
                    className={`${isOverridden ? "line-through" : ""} ${isDefault ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"} text-gray-600 px-2 py-1 rounded-md font-mono text-sm border flex-1 overflow-x-auto focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button
                    onClick={() => {
                      const updatedSearchParams = new URLSearchParams(searchParams.toString())
                      updatedSearchParams.delete('_b')
                      if (key === 'ddg') {
                        updatedSearchParams.delete('_d')
                      } else if (defaultBangs[key]) {
                        updatedSearchParams.set('_d', key)
                        updatedSearchParams.set('_b', 't')
                      } else {
                        updatedSearchParams.set('_d', key)
                      }
                      router.push(`/?${updatedSearchParams.toString()}`, { scroll: false })
                      toast.success(
                        "Default bang updated!",
                        {
                          description: `Searches without a bang will now use !${key}`,
                          className: "bg-primary text-white border-primary"
                        }
                      )
                    }}
                    disabled={isDefault}
                    className={`text-sm px-3 py-1.5 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-1.5 ${isDefault
                      ? "bg-surface text-primary/40 border border-primary/40 cursor-not-allowed opacity-50 hover:bg-surface hover:text-primary/40"
                      : "bg-surface text-primary border border-primary hover:bg-primary hover:text-white focus:ring-primary"
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    {isDefault ? "Default" : "Set Default"}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        {isImportModalOpen && (
          <ImportBangModal
            onClose={() => setIsImportModalOpen(false)}
            onImport={(key: string, url: string) => {
              // Check for existing bang
              if (searchParams.has(key) || defaultBangs[key]) {
                toast.error(
                  `The bang !${key} already exists!`,
                  {
                    description: defaultBangs[key]
                      ? "This is a built-in bang - try a different key."
                      : "You already have a custom bang with this key.",
                    className: "bg-red-500 text-white border-red-600"
                  }
                )
                return
              }

              const updatedSearchParams = new URLSearchParams(searchParams.toString())
              updatedSearchParams.set(key, url)
              router.push(`/?${updatedSearchParams.toString()}`)

              toast.success(
                `Imported !${key} bang!`,
                {
                  description: `You can now use !${key} to search ${new URL(`https://${url}`).hostname} 🎉`,
                  className: "bg-green-500 text-white border-green-600"
                }
              )
              setIsImportModalOpen(false)
            }}
          />
        )}

        {deleteConfirmation && (
          <ConfirmDialog
            title="Delete Bang"
            message={`Are you sure you want to delete the !${deleteConfirmation.key} bang? This action cannot be undone.`}
            onClose={() => setDeleteConfirmation(null)}
            onConfirm={confirmDelete}
          />
        )}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}


