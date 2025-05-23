"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Sparkles, Menu, X, DollarSign } from "lucide-react"
import { logOut } from "@/lib/auth-service"

export function DashboardNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleLogout = async () => {
    try {
      await logOut()
      window.location.href = "/login"
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Update the navigation links in the dashboard navbar
  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Deposit", href: "/deposit" },
    { name: "Withdraw", href: "/withdraw" },
    { name: "Invest", href: "/invest" },
    { name: "Referral", href: "/referral" },
  ]

  const menuItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/deposit", label: "Deposit" },
    { href: "/withdraw", label: "Withdraw" },
    { href: "/invest", label: "Invest" },
    { href: "/referral", label: "Referral" },
    { href: "/settings", label: "Settings" },
    { href: "#", label: "Sign Out", onClick: handleLogout },
  ]

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
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-[1400px] mx-auto">
          <div
            className="rounded-full border border-white/5 bg-slate-950/70 backdrop-blur-xl px-6 py-3
            shadow-[0_0_15px_rgba(37,99,235,0.1)]"
          >
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="relative">
                  <Sparkles className="w-6 h-6 text-blue-400 [filter:drop-shadow(0_0_8px_rgb(96,165,250))]" />
                </div>
                <span className="font-semibold text-white/90 text-lg tracking-wide">CoinOrbit</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (window.location.href = "/deposit")}
                  className="px-6 py-2 text-white font-medium rounded-xl transition-all duration-300
                    bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-md
                    shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]
                    hover:from-blue-500 hover:to-indigo-500 border border-blue-400/50"
                >
                  Deposit
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (window.location.href = "/withdraw")}
                  className="px-6 py-2 text-white font-medium rounded-xl transition-all duration-300
                    bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-md
                    shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]
                    hover:from-blue-500 hover:to-indigo-500 border border-blue-400/50"
                >
                  Withdraw
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (window.location.href = "/invest")}
                  className="px-6 py-2 text-white font-medium rounded-xl transition-all duration-300
                    bg-gradient-to-r from-green-600 to-emerald-600 backdrop-blur-md
                    shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]
                    hover:from-green-500 hover:to-emerald-500 border border-green-400/50"
                >
                  <DollarSign className="w-5 h-5 inline-block mr-1" />
                  Invest
                </motion.button>

                <button
                  onClick={() => (window.location.href = "/settings")}
                  className="p-2 text-white/70 hover:text-white transition-colors duration-200
                    rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900/80"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-6 py-2 text-white font-medium rounded-xl transition-all duration-300
                    bg-gradient-to-r from-red-600 to-pink-600 backdrop-blur-md
                    shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]
                    hover:from-red-500 hover:to-pink-500 border border-red-400/50"
                >
                  Sign Out
                </motion.button>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-white/70 hover:text-white transition-colors duration-200
                  rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900/80"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
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
                  {menuItems.map((item, index) => (
                    <motion.div key={item.label} variants={itemVariants} className="overflow-hidden">
                      {item.onClick ? (
                        <button
                          onClick={item.onClick}
                          className="block w-full text-2xl font-medium text-white/90 hover:text-red-400 
                            transition-colors duration-200 hover:[text-shadow:_0_0_20px_rgb(248_113_113_/_0.5)]
                            tracking-wider"
                        >
                          {item.label.toUpperCase()}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className="block text-2xl font-medium text-white/90 hover:text-blue-400 
                            transition-colors duration-200 hover:[text-shadow:_0_0_20px_rgb(147_197_253_/_0.5)]
                            tracking-wider"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label.toUpperCase()}
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

