import type React from "react"
import "./globals.css"
import './globals.css'

export const metadata = {
  title: "Bang.town",
  description: "Your custom search engine with powerful (and shareable!) bang shortcuts",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any"
      },
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "512x512"
      }
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180"
    }
  }
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