"use client"

import type React from "react"
import { Bangers } from "next/font/google"
import { usePathname } from "next/navigation"
import { useState, useCallback, useEffect } from "react"

const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: '--font-bangers' })

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const [points, setPoints] = useState<Array<{ size: string; left: string; top: string; delay: string }>>([])

  // Generate random positions for exclamation points
  const generateRandomPoints = useCallback(() => {
    const newPoints = []
    const sizes = ['text-6xl', 'text-7xl', 'text-8xl', 'text-9xl', 'text-[10rem]']

    for (let i = 0; i < 8; i++) {
      newPoints.push({
        size: sizes[Math.floor(Math.random() * sizes.length)],
        left: `${Math.random() * 90}%`,
        top: `${Math.random() * 90}%`,
        delay: `${Math.random() * 5}s`
      })
    }
    return newPoints
  }, [])

  // Only generate points on the client side
  useEffect(() => {
    setPoints(generateRandomPoints())
  }, [generateRandomPoints])

  return (
    <div className={`${bangers.variable} min-h-screen p-2 sm:p-4 flex flex-col items-center gap-4 sm:gap-8 relative overflow-hidden bg-background`}>
      {/* Background exclamation points */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {points.map((point, index) => (
          <div
            key={index}
            className={`floating-dot ${point.size} select-none`}
            style={{
              left: point.left,
              top: point.top,
              animationDelay: point.delay,
              willChange: 'transform'
            }}
          >
            !
          </div>
        ))}
      </div>

      {/* Main content - the "stem" of the exclamation point */}
      <div className="relative z-10 flex-1 w-full max-w-2xl flex flex-col items-center">
        <div className={`bg-surface p-4 sm:p-8 rounded-lg shadow-lg w-full ${isHomePage ? bangers.className : ''}`}>
          <a href="/" className="block hover:opacity-80 transition-opacity">
            <h1 className="text-3xl sm:text-4xl mb-2 text-center text-primary bangers">bang.town</h1>
          </a>
          <p className="text-center text-text-light mb-4 sm:mb-6 bangers text-lg sm:text-xl">
            Your custom search engine with powerful (and shareable!) bang shortcuts.
          </p>
          <main>{children}</main>
        </div>

        {/* Footer - the "dot" of the exclamation point */}
        <div className="mt-8 bg-surface p-4 sm:p-8 rounded-lg shadow-lg w-full">
          <footer className="flex flex-col items-center text-text-light text-sm">
            <div className="mb-2">
              Made with <span className="text-primary">❤</span> by{" "}
              <a
                href="https://x.com/dakdevs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                @dakdevs
              </a>
              {" · "}
              <a
                href="/about"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                About
              </a>
            </div>
            <a
              href="https://dak.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <img src="/dak-logo.svg" alt="dak logo" className="h-6 invert" />
            </a>
          </footer>
        </div>
      </div>
    </div>
  )
}

