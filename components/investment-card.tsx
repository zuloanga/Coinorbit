"use client"

import { motion } from "framer-motion"
import { Wallet, PiggyBank, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import Link from "next/link"

interface InvestmentCardProps {
  totalInvestment: number
  totalProfit: number
}

export function InvestmentCard({ totalInvestment, totalProfit }: InvestmentCardProps) {
  const roi = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100).toFixed(2) : "0.00"

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-auto rounded-3xl overflow-hidden"
      >
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-6 pb-8">
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute right-0 w-[200%] h-[120px] transform rotate-6"
                style={{
                  top: `${i * 100}px`,
                  background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
                }}
              />
            ))}
          </div>

          <div className="relative space-y-8">
            <div className="space-y-1">
              <div className="text-4xl font-bold text-white">${totalInvestment.toLocaleString()}</div>
              <div className="flex items-center gap-2 text-white/80">
                <Wallet className="w-5 h-5" />
                <span className="font-mono text-lg">Total Investment</span>
              </div>
            </div>

            <div className="h-px bg-white/20" />

            <div className="space-y-1">
              <div className="text-4xl font-bold text-white">${totalProfit.toLocaleString()}</div>
              <div className="flex items-center gap-2 text-white/80">
                <PiggyBank className="w-5 h-5" />
                <span className="font-mono text-lg">Total Profit</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 shadow-[0_0_30px_rgba(37,99,235,0.3)] pointer-events-none rounded-3xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center gap-4 max-w-md mx-auto"
      >
        <Link
          href="/deposit"
          className="flex-1 group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/0 hover:from-green-500/30 hover:to-green-500/10 border border-green-500/20 hover:border-green-500/30 px-4 py-3 transition-all duration-300"
        >
          <div className="relative flex flex-col items-center gap-1">
            <ArrowUpCircle className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-white">Deposit</span>
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
        </Link>

        <Link
          href="/withdraw"
          className="flex-1 group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/0 hover:from-red-500/30 hover:to-red-500/10 border border-red-500/20 hover:border-red-500/30 px-4 py-3 transition-all duration-300"
        >
          <div className="relative flex flex-col items-center gap-1">
            <ArrowDownCircle className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-white">Withdraw</span>
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
        </Link>

        <Link
          href="/invest"
          className="flex-1 group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/0 hover:from-blue-500/30 hover:to-blue-500/10 border border-blue-500/20 hover:border-blue-500/30 px-4 py-3 transition-all duration-300"
        >
          <div className="relative flex flex-col items-center gap-1">
            <ArrowUpCircle className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-white">Invest</span>
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
        </Link>
      </motion.div>
    </div>
  )
}
