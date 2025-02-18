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

  // Get default bang from URL params
  const defaultBang = searchParams.get('default') || 'ddg'

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

  // Ref to store current values for keyboard shortcuts
  const currentValuesRef = useRef({
    newBangKey,
    newBangUrl,
    fullUrl,
    customBangsLength: 0
  })

  // Track initial URL on first load
  useEffect(() => {
    const currentUrl = window.location.origin
    const params = new URLSearchParams(searchParams.toString())
    const urlParams = params.toString().replace(/&?q=[^&]*/, "")
    const initialFullUrl = `${currentUrl}/b/?${urlParams}&q=%s`
    setInitialUrl(initialFullUrl)
  }, []) // Empty dependency array means this only runs once on mount

  // Update fullUrl and check for changes
  useEffect(() => {
    const currentUrl = window.location.origin
    const params = new URLSearchParams(searchParams.toString())

    // Remove q parameter if it exists and add placeholder
    const urlParams = params.toString().replace(/&?q=[^&]*/, "")
    const currentFullUrl = `${currentUrl}/b/?${urlParams}&q=%s`
    setFullUrl(currentFullUrl)

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
                      className="text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                      setup instructions
                    </Link>
                    {" "}for help.
                  </>
                )}
              </div>
            ),
            dismissible: false,
            className: "bg-yellow-50 text-yellow-800 border border-yellow-200"
          }
        )
      } else {
        toast.dismiss("unsaved-changes")
      }
    }

    // Generate share URL that redirects to settings with current bangs
    const customBangs = new URLSearchParams()
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (key !== "q") {
        customBangs.set(key, value)
      }
    })
    setShareUrl(`${currentUrl}/b/?${customBangs.toString()}&q=!settings`)
  }, [searchParams, initialUrl])

  // Get custom bangs
  const customBangs = useMemo(() => {
    return Array.from(searchParams.entries())
      .filter(([key]) => key !== "q" && key !== "default")
      .map(([key, url]) => ({ key, url }))
  }, [searchParams])

  // Update ref when values change
  useEffect(() => {
    currentValuesRef.current = {
      newBangKey,
      newBangUrl,
      fullUrl,
      customBangsLength: customBangs.length
    }
  }, [newBangKey, newBangUrl, fullUrl, customBangs])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const current = currentValuesRef.current

      // Ctrl/Cmd + Enter to add bang
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && current.newBangKey && current.newBangUrl) {
        e.preventDefault()
        handleAddBang()
      }

      // Ctrl/Cmd + C when URL input is focused to copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement?.id === 'custom-search-url') {
        e.preventDefault()
        navigator.clipboard.writeText(current.fullUrl)
        track("custom_url_copied", {
          url: current.fullUrl,
          num_custom_bangs: customBangs.length,
          default_bang: defaultBang
        })
        toast.success(
          "URL copied!",
          {
            description: "Your custom search URL has been copied to your clipboard.",
            className: "bg-green-500 text-white border-green-600"
          }
        )
      }

      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && current.customBangsLength > 10) {
        e.preventDefault()
        document.getElementById('search-bangs-input')?.focus()
      }

      // Escape to clear search and blur input
      if (e.key === 'Escape' && document.activeElement?.id === 'search-bangs-input') {
        e.preventDefault()
        setSearchQuery('')
          ; (document.activeElement as HTMLElement).blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setSearchQuery])

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

      // Check if URL contains %s placeholder
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
          className: "bg-green-500 text-white border-green-600"
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
          className: "bg-green-500 text-white border-green-600"
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
        className: "bg-green-500 text-white border-green-600"
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
        <h2 id="custom-search-url-heading" className="text-xl sm:text-2xl mb-3 sm:mb-4 text-blue-500">Your Custom Search URL</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            id="custom-search-url"
            type="text"
            value={fullUrl}
            readOnly
            aria-label="Your custom search URL"
            className="bg-gray-100 p-2 rounded text-sm flex-grow h-10 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-x-auto"
            onClick={(e) => e.currentTarget.select()}
          />
          <div className="flex gap-2" role="group" aria-label="URL sharing options">
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
                    className: "bg-green-500 text-white border-green-600"
                  }
                )
              }}
              aria-label="Copy custom search URL to clipboard"
              className="flex-1 sm:flex-none bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 flex items-center justify-center gap-2"
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
              className="flex-1 sm:flex-none bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
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
        <div className="mt-2 space-y-2 text-sm text-gray-600">
          <p>Pro tip: Use <code className="bg-gray-100 px-1 py-0.5 rounded">!settings</code> to quickly return to this page with your custom bangs.</p>
          <p>Need help setting up? Check out our <a href="/instructions" className="text-blue-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">browser setup instructions</a>.</p>
        </div>
      </div>

      <div className="mb-4 sm:mb-6" role="region" aria-labelledby="add-bang-heading">
        <h2 id="add-bang-heading" className="text-xl sm:text-2xl mb-3 sm:mb-4 text-blue-500">Add Custom Bang</h2>
        <div className="flex flex-col sm:flex-row gap-2" role="form" aria-label="Add custom bang form">
          <div className="relative w-full sm:w-1/4">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" aria-hidden="true">!</span>
            <input
              type="text"
              value={newBangKey}
              onChange={(e) => setNewBangKey(e.target.value)}
              placeholder="Bang key (e.g., g)"
              aria-label="Bang key"
              className="border border-gray-300 p-2 pl-6 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  document.getElementById('bang-url-input')?.focus()
                }
              }}
            />
          </div>
          <div className="relative flex-grow">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" aria-hidden="true">https://</span>
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddBang()
                }
              }}
              placeholder="URL (e.g., www.google.com/search?q=%s)"
              aria-label="Bang URL"
              className="border border-gray-300 p-2 pl-16 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleAddBang}
            aria-label="Add custom bang"
            className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mb-4 sm:mb-6" role="region" aria-labelledby="custom-bangs-heading">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg">
          <h2 id="custom-bangs-heading" className="text-xl sm:text-2xl text-white">Custom Bangs</h2>
          <button
            onClick={() => setIsImportModalOpen(true)}
            aria-label="Import bang configuration"
            className="w-full sm:w-auto bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500"
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
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
                    className="w-full h-10 pl-8 pr-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500" role="status">
                  Showing {filteredBangs.length} of {customBangs.length} bangs
                </p>
              </div>
            )}
            <ul className="space-y-3" role="list" aria-label="Custom bangs list">
              {filteredBangs
                .sort((a, b) => {
                  const aIsNew = !initialUrl.includes(a.key)
                  const bIsNew = !initialUrl.includes(b.key)
                  if (aIsNew && !bIsNew) return -1
                  if (!aIsNew && bIsNew) return 1
                  return 0
                })
                .map(({ key, url }) => {
                  const isNew = !initialUrl.includes(key)
                  const isDefault = key === defaultBang
                  return (
                    <li key={key} className={`${isDefault ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100"} rounded-lg p-2 flex flex-col gap-2`} role="listitem">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <code className={`${isDefault ? "bg-blue-100 border-blue-200 text-blue-800" : "bg-blue-50 border-blue-100 text-blue-700"} px-2 py-1 rounded-md font-mono text-sm border font-medium min-w-[3rem] text-center`}>
                            !{key}
                          </code>
                          <span className="text-gray-300 select-none">→</span>
                          <span className={`${isDefault ? "text-blue-800" : "text-purple-700"} font-medium`}>
                            {new URL(`https://${url}`).hostname}
                          </span>
                        </div>
                        {(isNew || isDefault) && (
                          <div className="flex gap-1">
                            {isNew && (
                              <span className="text-blue-600 text-xs font-medium px-2 py-1 bg-blue-50 rounded-md border border-blue-200" role="status">
                                New
                              </span>
                            )}
                            {isDefault && (
                              <span className="text-blue-600 text-xs font-medium px-2 py-1 bg-blue-50 rounded-md border border-blue-200" role="status">
                                Default
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex-1 flex items-center">
                          <input
                            type="text"
                            value={`https://${url}`}
                            readOnly
                            className={`${isDefault ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"} text-gray-600 px-2 py-1 rounded-md font-mono text-sm border flex-1 overflow-x-auto focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            onClick={(e) => e.currentTarget.select()}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            const updatedSearchParams = new URLSearchParams(searchParams.toString())
                            if (key === 'ddg') {
                              updatedSearchParams.delete('default')
                            } else {
                              updatedSearchParams.set('default', key)
                            }
                            router.push(`/?${updatedSearchParams.toString()}`, { scroll: false })
                            toast.success(
                              "Default bang updated!",
                              {
                                description: `Searches without a bang will now use !${key}`,
                                className: "bg-green-500 text-white border-green-600"
                              }
                            )
                          }}
                          disabled={isDefault}
                          className={`text-sm px-3 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-1.5 ${isDefault
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500"
                            }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                          {isDefault ? "Default" : "Set Default"}
                        </button>
                        <button
                          onClick={() => handleShareBang(key, url)}
                          className="text-sm px-3 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-1.5"
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
                          className="text-sm px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center gap-1.5"
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
          <div className="text-center p-4 bg-gray-100 rounded-lg" role="status">
            <p className="text-gray-600 mb-2">You haven't added any custom bangs yet.</p>
            <p className="text-blue-500">Add your first custom bang above to get started!</p>
          </div>
        )}
      </div>

      <div role="region" aria-labelledby="default-bangs-heading">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4 rounded-lg">
          <h2 id="builtin-bangs-heading" className="text-xl sm:text-2xl text-white">Built-in Bangs</h2>
          <p className="text-sm text-gray-200">These are the built-in bangs that come with bang.town</p>
        </div>
        <ul className="space-y-2" role="list" aria-label="Built-in bangs list">
          {Object.entries(defaultBangs).map(([key, url]) => {
            const isOverridden = searchParams.has(key)
            const name = getBangName(key)
            const isDefault = key === defaultBang
            return (
              <li key={key} className={`${isOverridden ? "opacity-75" : ""} ${isDefault ? "bg-blue-50" : "bg-white"} border ${isDefault ? "border-blue-200" : "border-gray-100"} rounded-lg p-2 flex flex-wrap items-center gap-2`} role="listitem">
                <div className="flex items-center gap-2 min-w-[200px]">
                  <code className={`${isOverridden ? "line-through" : ""} ${isDefault ? "bg-blue-100 border-blue-200 text-blue-800" : "bg-blue-50 border-blue-100 text-blue-700"} px-2 py-1 rounded-md font-mono text-sm border font-medium min-w-[3rem] text-center`}>
                    !{key}
                  </code>
                  <span className="text-gray-300 select-none">→</span>
                  <span className={`${isOverridden ? "line-through" : ""} ${isDefault ? "text-blue-800" : "text-purple-700"} font-medium`}>
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
                      if (key === 'ddg') {
                        updatedSearchParams.delete('default')
                      } else {
                        updatedSearchParams.set('default', key)
                      }
                      router.push(`/?${updatedSearchParams.toString()}`, { scroll: false })
                      toast.success(
                        "Default bang updated!",
                        {
                          description: `Searches without a bang will now use !${key}`,
                          className: "bg-green-500 text-white border-green-600"
                        }
                      )
                    }}
                    disabled={isDefault}
                    className={`text-sm px-3 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-1.5 ${isDefault
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500"
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


