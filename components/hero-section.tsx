"use client"

import Image from "next/image"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { Users, HandCoins, TrendingUp, Wallet } from "lucide-react"
import { motion } from "framer-motion"

const stats = [
  {
    value: "100K+",
    label: "Active Users",
    icon: Users,
    iconColor: "text-pink-400",
    iconBg: "bg-pink-400/10",
  },
  {
    value: "$500M+",
    label: "Total Investments",
    icon: HandCoins,
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-400/10",
  },
  {
    value: "30+",
    label: "Investment Plans",
    icon: TrendingUp,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-400/10",
  },
  {
    value: "24/7",
    label: "Expert Support",
    icon: Wallet,
    iconColor: "text-red-400",
    iconBg: "bg-red-400/10",
  },
]

export function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden pt-16 min-h-screen bg-transparent"
    >
      <div className="container relative mx-auto px-4 pt-8 pb-20">
        <div className="flex flex-col lg:flex-row items-center lg:items-center lg:justify-between gap-12">
          {/* Text Content - Left Side */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-1/2 text-left"
          >
            <h1 className="text-3xl lg:text-5xl font-bold text-white/90 mb-6 [text-shadow:_0_0_30px_rgb(29_78_216_/_0.2)]">
              Maximize Your Profits with OrbitInvest
            </h1>
            <p className="text-base lg:text-lg text-blue-100/70 mb-8 max-w-2xl lg:max-w-none">
              Experience the future of crypto investing with our AI-powered platform. Maximize returns, minimize risks,
              and stay ahead in the dynamic world of digital assets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white
                  bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl transition-all duration-300 backdrop-blur-md
                  shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.8)]
                  hover:from-blue-500 hover:to-indigo-500 border border-blue-400/50"
                >
                  <Sparkles className="w-4 h-4 [filter:drop-shadow(0_0_5px_rgb(59,130,246))]" />
                  Start Investing
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="#"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white
                  bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl transition-all duration-300 backdrop-blur-md
                  shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]
                  hover:from-gray-600 hover:to-gray-800 border border-gray-500/50"
                >
                  <Sparkles className="w-4 h-4" />
                  Explore Features
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Hero Image - Right Side */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full lg:w-1/2 relative flex justify-center items-center lg:justify-end"
          >
            <div className="relative w-[280px] sm:w-[340px] md:w-[400px] lg:w-[500px]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ai-generated-8627457_1280-removebg-preview-W7bo9JXGhXVLCFf0kStaEZT1j72v8e.png"
                alt="CoinOrbit AI Investment Assistant"
                width={500}
                height={600}
                className="relative z-10 drop-shadow-[0_0_30px_rgba(29,78,216,0.3)]"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))",
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Updated Stats Row */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 rounded-2xl p-4 sm:p-6 border border-white/5
                backdrop-blur-xl bg-slate-900/50 transition-all duration-300"
              >
                <div className={`p-2 sm:p-3 rounded-xl ${stat.iconBg}`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-base sm:text-lg font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.div>
  )
}

