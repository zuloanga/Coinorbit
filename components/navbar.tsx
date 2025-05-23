"use client"

import { useState, useEffect } from "react"
import { Menu, X, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { auth } from "@/lib/firebase"
import { logOut } from "@/lib/auth-service"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await logOut()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const navItems = [
    { label: "HOME", href: "/" },
    { label: "FEATURES", href: "#features" },
    { label: "PRICING", href: "#pricing" },
    { label: "ABOUT", href: "#about" },
  ]

  if (user) {
    navItems.push({ label: "DASHBOARD", href: "/dashboard" }, { label: "REFERRAL", href: "/referral" })
  }

  const menuVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    closed: {
      opacity: 0,
      y: 20,
    },
    open: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <>
      <nav className="fixed top-0 z-50 w-full px-4 py-6">
        <div className="mx-auto max-w-[1400px]">
          <div
            className="rounded-full border border-white/5 bg-slate-950/70 backdrop-blur-xl px-6 py-3
            shadow-[0_0_15px_rgba(37,99,235,0.1)]"
          >
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3">
                <div className="relative">
                  <Sparkles className="w-6 h-6 text-blue-400 [filter:drop-shadow(0_0_8px_rgb(96,165,250))]" />
                </div>
                <span className="font-semibold text-white/90 text-lg tracking-wide">CoinOrbit</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-white/70 hover:text-blue-400 transition-colors duration-200
                      hover:[text-shadow:_0_0_10px_rgb(147_197_253_/_0.3)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Sign In/Out Button */}
              <div className="hidden md:block">
                {user ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="px-6 py-2 text-white font-medium rounded-xl transition-all duration-300 bg-gradient-to-r from-red-600 to-pink-600 backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:from-red-500 hover:to-pink-500 border border-red-400/50"
                  >
                    Sign Out
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => (window.location.href = "/login")}
                    className="px-6 py-2 text-white font-medium rounded-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-md shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:from-blue-500 hover:to-indigo-500 border border-blue-400/50"
                  >
                    Sign In
                  </motion.button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="md:hidden relative z-50 text-white/90 p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X size={24} className="[filter:drop-shadow(0_0_5px_rgb(156,163,175))]" />
                ) : (
                  <Menu size={24} className="[filter:drop-shadow(0_0_5px_rgb(156,163,175))]" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Full Screen Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Background with gradient and blur */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/95 to-blue-950/95 backdrop-blur-xl">
              {/* Menu Content */}
              <div className="relative h-full flex flex-col items-center justify-center">
                {/* Navigation Links */}
                <div className="space-y-8 text-center">
                  {navItems.map((item, index) => (
                    <motion.div key={item.label} variants={itemVariants} className="overflow-hidden">
                      <Link
                        href={item.href}
                        className="block text-2xl font-medium text-white/90 hover:text-blue-400 
                          transition-colors duration-200 hover:[text-shadow:_0_0_20px_rgb(147_197_253_/_0.5)]
                          tracking-wider"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}

                  {/* Sign In/Out Button */}
                  <motion.div variants={itemVariants} className="pt-4">
                    {user ? (
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsMenuOpen(false)
                        }}
                        className="px-12 py-3 text-white font-medium rounded-xl transition-all duration-300
                        bg-gradient-to-r from-red-600 to-pink-600 backdrop-blur-md
                        shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]
                        hover:from-red-500 hover:to-pink-500 border border-red-400/50
                        tracking-wider"
                      >
                        SIGN OUT
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        className="inline-block px-12 py-3 text-white font-medium rounded-xl transition-all duration-300
                        bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-md
                        shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]
                        hover:from-blue-500 hover:to-indigo-500 border border-blue-400/50
                        tracking-wider"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        SIGN IN
                      </Link>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

