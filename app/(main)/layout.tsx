"use client"

import type React from "react"
import { Bangers } from "next/font/google"
import { usePathname } from "next/navigation"

const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: '--font-bangers' })

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <div className={`${bangers.variable} min-h-screen p-2 sm:p-4 flex flex-col items-center gap-4 sm:gap-8 bg-gray-100 rounded-lg`}>
      <div className={`bg-white p-4 sm:p-8 rounded-lg shadow-lg w-full max-w-2xl ${isHomePage ? bangers.className : ''}`}>
        <a href="/" className="block hover:opacity-80 transition-opacity">
          <h1 className="text-3xl sm:text-4xl mb-2 text-center text-blue-600 bangers">bang.town</h1>
        </a>
        <p className="text-center text-gray-600 mb-4 sm:mb-6 bangers text-lg sm:text-xl">Your custom search engine with powerful (and shareable!) bang shortcuts.</p>
        <main>{children}</main>
      </div>
      <footer className="flex flex-col items-center text-gray-500 text-sm mt-auto px-4">
        <div className="mb-4">
          Made with <span className="text-red-500">❤</span> by{" "}
          <a
            href="https://x.com/dakdevs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            @dakdevs
          </a>
          {" · "}
          <a
            href="/about"
            className="text-blue-500 hover:text-blue-600 transition-colors"
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
          <img src="/dak-logo.svg" alt="dak logo" className="h-6" />
        </a>
      </footer>
    </div>
  )
}

