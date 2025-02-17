import type React from "react"
import "./globals.css"
import './globals.css'

export const metadata = {
  title: "Bang Redirect",
  description: "Redirect using DuckDuckGo-style bangs",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}



import './globals.css'