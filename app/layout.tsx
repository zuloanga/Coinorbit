import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/toast-provider"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "CoinOrbit - Innovative Crypto Investment Platform",
  description: "Explore the future of crypto investments with CoinOrbit's AI-powered platform.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="bg-[#030712] min-h-screen font-sans text-sm">
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}

