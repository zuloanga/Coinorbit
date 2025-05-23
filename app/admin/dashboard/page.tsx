"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, DollarSign, TrendingUp, AlertCircle, RefreshCcw, Search } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { auth } from "@/lib/firebase"
import { getAdminData } from "@/lib/auth-service"
import { getPlatformStats, getRecentTransactions, getTotalPlatformValue } from "@/lib/admin-service"
import { cardStyles, buttonStyles } from "@/lib/styles"
import { Loader } from "@/components/ui/loader"
import { toast } from "sonner"
import Link from "next/link"

interface WeeklyStats {
  currentWeek: number
  previousWeek: number
  percentageChange: string
}

interface PlatformStats {
  users: WeeklyStats
  deposits: WeeklyStats
  investments: WeeklyStats
  withdrawals: WeeklyStats
}

interface Transaction {
  id: string
  type: "deposit" | "withdraw"
  amount: number
  userId: string
  timestamp: any
  userName?: string
  userEmail?: string
}

const defaultStats: PlatformStats = {
  users: { currentWeek: 0, previousWeek: 0, percentageChange: "0" },
  deposits: { currentWeek: 0, previousWeek: 0, percentageChange: "0" },
  investments: { currentWeek: 0, previousWeek: 0, percentageChange: "0" },
  withdrawals: { currentWeek: 0, previousWeek: 0, percentageChange: "0" },
}

export default function AdminDashboardPage() {
  const [adminData, setAdminData] = useState<any>(null)
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [platformValue, setPlatformValue] = useState<number>(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("No authenticated user")
      }

      const [adminDataResult, statsResult, transactionsResult, platformValueResult] = await Promise.all([
        getAdminData(user.uid),
        getPlatformStats(),
        getRecentTransactions(5),
        getTotalPlatformValue(),
      ])

      if (!adminDataResult) {
        throw new Error("Failed to fetch admin data")
      }

      setAdminData(adminDataResult)
      setStats(statsResult)
      setTransactions(transactionsResult)
      setPlatformValue(platformValueResult)
      setError(null)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard", {
        description: "Please try again or check your connection",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchData()
      toast.success("Dashboard updated", {
        description: "All data has been refreshed successfully",
      })
    } catch (error) {
      console.error("Error refreshing dashboard:", error)
      toast.error("Failed to refresh dashboard")
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader size="large" />
        </div>
      </AdminLayout>
    )
  }

  const platformStats = [
    {
      title: "Total Users",
      value: stats?.users.currentWeek.toLocaleString() || "0",
      change: `${stats?.users.percentageChange || "0"}% this week`,
      icon: Users,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-400/10",
    },
    {
      title: "Platform Value",
      value: `$${platformValue.toLocaleString()}`,
      change: `Based on all transactions`,
      icon: DollarSign,
      iconColor: "text-green-400",
      iconBg: "bg-green-400/10",
    },
    {
      title: "Active Investments",
      value: stats?.investments.currentWeek.toLocaleString() || "0",
      change: `${stats?.investments.previousWeek || "0"} new this week`,
      icon: TrendingUp,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-400/10",
    },
    {
      title: "Weekly Withdrawals",
      value: `$${stats?.withdrawals.currentWeek.toLocaleString() || "0"}`,
      change: `${stats?.withdrawals.percentageChange || "0"}% vs last week`,
      icon: AlertCircle,
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-400/10",
    },
  ]

  return (
    <AdminLayout>
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome back, {adminData?.fullName}</h1>
              <p className="text-white/70 mt-1">Here's what's happening with your platform today.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className={`${buttonStyles.secondary} flex items-center gap-2`}
            >
              <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </motion.button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {platformStats.map((stat, index) => {
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
                    <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <div>
                      <div className="text-sm text-white/70">{stat.title}</div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className={`text-sm ${stat.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                        {stat.change}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`${cardStyles.wrapper} ${cardStyles.hoverEffect} p-6`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
              >
                <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </motion.button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-white/70 border-b border-white/5">
                    <th className="pb-4">Type</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4">User</th>
                    <th className="pb-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="text-white hover:bg-white/5">
                        <td className="py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              tx.type === "deposit" ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-4">${tx.amount?.toLocaleString() || "0"}</td>
                        <td className="py-4">
                          <div>
                            <div className="font-medium">{tx.userName || "Unknown"}</div>
                            <div className="text-xs text-white/50">{tx.userEmail || tx.userId || "Unknown"}</div>
                          </div>
                        </td>
                        <td className="py-4 text-white/70">
                          {tx.timestamp?.toDate
                            ? tx.timestamp.toDate().toLocaleString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Unknown"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-white/50">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Search className="w-5 h-5 text-blue-400" />
                          </div>
                          <p>No transactions found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {transactions.length > 0 && (
              <div className="mt-4 text-right">
                <Link href="/admin/transactions" className="text-blue-400 hover:text-blue-300 text-sm">
                  View all transactions →
                </Link>
              </div>
            )}
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className={`${cardStyles.wrapper} ${cardStyles.hoverEffect} p-6 mt-6`}
          >
            <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Server Status", status: "Operational", color: "text-green-400" },
                { name: "API Health", status: "Optimal", color: "text-green-400" },
                { name: "Database Load", status: "Normal", color: "text-blue-400" },
              ].map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-slate-800/50">
                  <div className="text-white/70 text-sm mb-1">{item.name}</div>
                  <div className={`font-medium ${item.color}`}>{item.status}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </AdminLayout>
  )
}

