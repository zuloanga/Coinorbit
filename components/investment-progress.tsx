"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, DollarSign, PieChart, Timer } from "lucide-react"
import { calculateROI, getInvestmentStats } from "@/lib/investment-service"
import { cardStyles } from "@/lib/styles"
import { Loader } from "@/components/ui/loader"

interface InvestmentProgressProps {
  userId: string
  investments: any[]
}

export function InvestmentProgress({ userId, investments }: InvestmentProgressProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateInvestments = async () => {
      try {
        // Update ROI for all active investments
        await Promise.all(
          investments.filter((inv) => inv.status === "active").map((inv) => calculateROI(userId, inv.id)),
        )

        // Get updated stats
        const newStats = await getInvestmentStats(userId)
        setStats(newStats)
      } catch (error) {
        console.error("Error updating investments:", error)
      } finally {
        setLoading(false)
      }
    }

    updateInvestments()

    // Update every 12 hours instead of every minute
    const interval = setInterval(updateInvestments, 12 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [userId, investments])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader size="large" />
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Invested",
      value: `$${stats?.totalInvested.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      title: "Total Profit",
      value: `$${stats?.totalProfit.toLocaleString() || "0"}`,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      title: "Active Investments",
      value: stats?.activeInvestments || "0",
      icon: PieChart,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      title: "ROI",
      value: `${stats?.roi.toFixed(2) || "0"}%`,
      icon: Timer,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`${cardStyles.wrapper} ${cardStyles.hoverEffect} p-6`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-sm text-white/70">{stat.title}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
