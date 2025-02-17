"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Toaster, toast } from "sonner"
import { ImportBangModal } from "../components/ImportBangModal"

const defaultBangs: Record<string, string> = {
  g: "www.google.com/search?q=",
  w: "en.wikipedia.org/w/index.php?search=",
  c: "chatgpt.com?q=",
  "4o": "chatgpt.com?model=gpt-4o&q=",
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

function generateBangCode(key: string, url: string) {
  const bangConfig = { key, url }
  return btoa(JSON.stringify(bangConfig))
}

function decodeBangCode(code: string) {
  try {
    const bangConfig = JSON.parse(atob(code))
    if (!bangConfig.key || !bangConfig.url) {
      throw new Error('Invalid bang configuration')
    }
    return bangConfig
  } catch (error) {
    return null
  }
}

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [newBangKey, setNewBangKey] = useState("")
  const [newBangUrl, setNewBangUrl] = useState("")
  const [fullUrl, setFullUrl] = useState("")
  const [shareUrl, setShareUrl] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  useEffect(() => {
    const currentUrl = window.location.origin
    setFullUrl(`${currentUrl}/b/?${searchParams.toString().replace(/&?q=[^&]*/, "")}&q=%s`)

    // Generate share URL that redirects to settings with current bangs
    const customBangs = new URLSearchParams()
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (key !== "q") {
        customBangs.set(key, value)
      }
    })
    setShareUrl(`${currentUrl}/b/?${customBangs.toString()}&q=!settings`)
  }, [searchParams])

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

      // Check for duplicate bang key
      if (searchParams.has(newBangKey) || defaultBangs[newBangKey]) {
        toast.error(
          `The bang !${newBangKey} already exists!`,
          {
            description: defaultBangs[newBangKey]
              ? "This is a default bang - try a different key."
              : "You already have a custom bang with this key.",
            className: "bg-red-500 text-white border-red-600"
          }
        )
        return
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
    const updatedSearchParams = new URLSearchParams(searchParams.toString())
    updatedSearchParams.delete(key)
    router.push(`/?${updatedSearchParams.toString()}`)
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Bang Town Custom Bangs",
          text: "Check out my custom search bangs!",
          url: shareUrl
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Share URL copied to clipboard!", {
          className: "bg-green-500 text-white border-green-600"
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Failed to share URL", {
          className: "bg-red-500 text-white border-red-600"
        })
      }
    }
  }

  const handleShareBang = (key: string, url: string) => {
    const code = generateBangCode(key, url)
    navigator.clipboard.writeText(code)
    toast.success(
      "Bang code copied!",
      {
        description: "Share this code with others so they can import your bang configuration.",
        className: "bg-green-500 text-white border-green-600"
      }
    )
  }

  // Get custom bangs
  const customBangs = useMemo(() => {
    return Array.from(searchParams.entries())
      .filter(([key]) => key !== "q")
      .map(([key, url]) => ({ key, url }))
  }, [searchParams])

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
      <Toaster />
      <div className="mb-6">
        <h2 className="text-2xl mb-4 text-blue-500">Your Custom Search URL</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={fullUrl}
            readOnly
            className="bg-gray-100 p-2 rounded text-sm flex-grow h-10 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={(e) => e.currentTarget.select()}
          />
          <button
            onClick={() => navigator.clipboard.writeText(fullUrl)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors whitespace-nowrap"
          >
            Copy
          </button>
          <button
            onClick={handleShare}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>
        </div>
        <div className="mt-2 space-y-2 text-sm text-gray-600">
          <p>Pro tip: Use <code className="bg-gray-100 px-1 py-0.5 rounded">!settings</code> to quickly return to this page with your custom bangs.</p>
          <p>Need help setting up? Check out our <a href="/instructions" className="text-blue-500 hover:text-blue-600 transition-colors">browser setup instructions</a>.</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl mb-4 text-blue-500">Add Custom Bang</h2>
        <div className="flex gap-2">
          <div className="relative w-1/4">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">!</span>
            <input
              type="text"
              value={newBangKey}
              onChange={(e) => setNewBangKey(e.target.value)}
              placeholder="Bang key (e.g., g)"
              className="border border-gray-300 p-2 pl-6 rounded w-full"
            />
          </div>
          <div className="relative flex-grow">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">https://</span>
            <input
              type="text"
              value={newBangUrl}
              onChange={(e) => setNewBangUrl(e.target.value.replace(/^(https?:\/\/)/, ""))}
              onPaste={(e) => {
                e.preventDefault()
                const pastedText = e.clipboardData.getData("text")
                setNewBangUrl(pastedText.replace(/^(https?:\/\/)/, ""))
              }}
              placeholder="URL (e.g., www.google.com/search?q=%s)"
              className="border border-gray-300 p-2 pl-16 rounded w-full"
            />
          </div>
          <button
            onClick={handleAddBang}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-blue-500">Custom Bangs</h2>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search custom bangs..."
                    className="w-full h-10 pl-8 pr-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Showing {filteredBangs.length} of {customBangs.length} bangs
                </p>
              </div>
            )}
            <ul className="space-y-2">
              {filteredBangs.map(({ key, url }) => (
                <li key={key} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>
                    <strong className="text-blue-500">!{key}:</strong> https://{url}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShareBang(key, url)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => handleDeleteBang(key)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600 mb-2">You haven't added any custom bangs yet.</p>
            <p className="text-blue-500">Add your first custom bang above to get started!</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl mb-4 text-blue-500">Default Bangs</h2>
        <ul className="space-y-2">
          {Object.entries(defaultBangs).map(([key, url]) => {
            const isOverridden = searchParams.has(key)
            return (
              <li key={key} className={`${isOverridden ? "line-through text-gray-500" : ""}`}>
                <strong>!{key}:</strong> https://{url}
                {isOverridden && <span className="ml-2 text-red-500">(Overridden)</span>}
              </li>
            )
          })}
        </ul>
      </div>

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
                    ? "This is a default bang - try a different key."
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

