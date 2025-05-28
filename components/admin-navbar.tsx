"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Shield, Menu, X, Users, DollarSign, Activity } from "lucide-react"
import { logOut } from "@/lib/auth-service"

export function AdminNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleLogout = async () => {
    try {
      await logOut()
      window.location.href = "/admin/login"
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const menuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Activity },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/transactions", label: "Transactions", icon: DollarSign },
    { href: "/admin/settings", label: "Settings", icon: Settings },
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
          <div className="rounded-full border border-white/5 bg-slate-950/70 backdrop-blur-xl px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <div className="relative">
                  <Shield className="w-6 h-6 text-blue-400 [filter:drop-shadow(0_0_8px_rgb(96,165,250))]" />
                </div>
                <span className="font-semibold text-white/90 text-lg tracking-wide">Admin Panel</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-2 text-white/70 hover:text-blue-400 transition-colors duration-200"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-white font-medium rounded-lg transition-all duration-300
                    bg-red-500/10 hover:bg-red-500/20 border border-red-500/50"
                >
                  Logout
                </button>
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/95 to-blue-950/95 backdrop-blur-xl">
              <div className="relative h-full flex flex-col items-center justify-center">
                <div className="space-y-8 text-center">
                  {menuItems.map((item) => (
                    <motion.div key={item.label} variants={itemVariants} className="overflow-hidden">
                      <Link
                        href={item.href}
                        className="flex items-center justify-center gap-2 text-2xl font-medium text-white/90 hover:text-blue-400 
                          transition-colors duration-200 hover:[text-shadow:_0_0_20px_rgb(147_197_253_/_0.5)]
                          tracking-wider"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="w-6 h-6" />
                        {item.label.toUpperCase()}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleLogout}
                      className="px-8 py-3 text-white font-medium rounded-xl transition-all duration-300
                        bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-lg"
                    >
                      LOGOUT
                    </button>
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
