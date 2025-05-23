"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Check, X, RefreshCcw } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { getAllInvestments, updateInvestmentStatus, processInvestmentPayout } from "@/lib/admin-service"
import { cardStyles, buttonStyles, inputStyles } from "@/lib/styles"
import { Loader } from "@/components/ui/loader"
import { toast } from "sonner"
import { auth } from "@/lib/firebase"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Investment {
  id: string
  userId: string
  userEmail: string
  userName: string
  planId: string
  amount: number
  expectedReturn: number
  roi: number
  status: string
  investmentDate: any
  maturityDate: any
  payoutStatus: string
  reinvestment: boolean
}

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchInvestments()
  }, [])

  const fetchInvestments = async () => {
    try {
      setLoading(true)
      const data = await getAllInvestments()
      setInvestments(data)
    } catch (error) {
      console.error("Error fetching investments:", error)
      toast.error("Failed to load investments", {
        description: "Please check your connection and try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchInvestments()
      toast.success("Investments refreshed successfully")
    } catch (error) {
      console.error("Error refreshing investments:", error)
      toast.error("Failed to refresh investments")
    } finally {
      setRefreshing(false)
    }
  }

  const handleProcessPayout = async (investment: Investment) => {
    if (!investment.userId || !investment.id) {
      toast.error("Invalid investment data")
      return
    }

    setProcessing(true)
    try {
      const adminUser = auth.currentUser
      if (!adminUser) {
        throw new Error("Admin not authenticated")
      }

      await processInvestmentPayout(investment.userId, investment.id, adminUser.uid)

      // Update local state
      setInvestments((prev) =>
        prev.map((inv) =>
          inv.id === investment.id ? { ...inv, status: "completed", payoutStatus: "completed" } : inv,
        ),
      )

      toast.success("Investment payout processed successfully", {
        description: `$${investment.expectedReturn.toLocaleString()} has been added to the user's balance.`,
      })
    } catch (error) {
      console.error("Error processing payout:", error)
      toast.error("Failed to process payout", {
        description: "Please try again or check the logs for more details.",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleCancelInvestment = async (investment: Investment) => {
    if (!investment.userId || !investment.id) {
      toast.error("Invalid investment data")
      return
    }

    setProcessing(true)
    try {
      await updateInvestmentStatus(investment.userId, investment.id, "cancelled")

      // Update local state
      setInvestments((prev) => prev.map((inv) => (inv.id === investment.id ? { ...inv, status: "cancelled" } : inv)))

      toast.success("Investment cancelled successfully")
    } catch (error) {
      console.error("Error cancelling investment:", error)
      toast.error("Failed to cancel investment", {
        description: "Please try again or check the logs for more details.",
      })
    } finally {
      setProcessing(false)
    }
  }

  const filteredInvestments = investments.filter((investment) => {
    const matchesSearch =
      investment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.planId?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || investment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
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

  return (
    <AdminLayout>
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white [text-shadow:_0_0_30px_rgb(29_78_216_/_0.2)]">
                Investment Management
              </h1>
              <p className="text-blue-100/70 mt-1">Manage user investment plans and payouts</p>
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

          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by user or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputStyles.base} pl-10`}
              />
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`${buttonStyles.secondary} gap-2`}>
                <Filter className="w-4 h-4" />
                Status: {statusFilter === "all" ? "All" : statusFilter}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>Cancelled</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Investments Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`${cardStyles.wrapper} overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-white/70 border-b border-white/5">
                    <th className="p-4">User</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Expected Return</th>
                    <th className="p-4">Investment Date</th>
                    <th className="p-4">Maturity Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredInvestments.length > 0 ? (
                    filteredInvestments.map((investment) => (
                      <tr key={investment.id} className="text-white hover:bg-white/5">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{investment.userName}</div>
                            <div className="text-sm text-white/70">{investment.userEmail}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium capitalize">{investment.planId.replace(/_/g, " ")}</div>
                          <div className="text-sm text-white/70">{investment.roi}% ROI</div>
                        </td>
                        <td className="p-4">${investment.amount.toLocaleString()}</td>
                        <td className="p-4">
                          <span className="text-green-400">${investment.expectedReturn.toLocaleString()}</span>
                        </td>
                        <td className="p-4 text-white/70">{formatDate(investment.investmentDate)}</td>
                        <td className="p-4 text-white/70">{formatDate(investment.maturityDate)}</td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              investment.status === "active"
                                ? "bg-blue-500/10 text-blue-500"
                                : investment.status === "completed"
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {investment.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {investment.status === "active" && (
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleProcessPayout(investment)}
                                disabled={processing}
                                className="p-2 rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20"
                                title="Process Payout"
                              >
                                <Check className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCancelInvestment(investment)}
                                disabled={processing}
                                className="p-2 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20"
                                title="Cancel Investment"
                              >
                                <X className="w-5 h-5" />
                              </motion.button>
                            </div>
                          )}
                          {investment.status !== "active" && (
                            <div className="text-white/50 text-sm">
                              {investment.status === "completed" ? "Paid out" : "Cancelled"}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Search className="w-6 h-6 text-blue-400" />
                          </div>
                          <p className="text-white font-medium">No investments found</p>
                          <p className="text-white/50 text-sm">
                            {statusFilter !== "all"
                              ? `There are no ${statusFilter} investments.`
                              : "Try adjusting your filters or search term."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Investment Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`${cardStyles.wrapper} ${cardStyles.hoverEffect} p-6 mt-8`}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Investment Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Total Active Investments",
                  value: investments.filter((i) => i.status === "active").length,
                  color: "text-blue-400",
                },
                {
                  title: "Total Investment Value",
                  value: `$${investments
                    .filter((i) => i.status === "active")
                    .reduce((sum, i) => sum + i.amount, 0)
                    .toLocaleString()}`,
                  color: "text-white",
                },
                {
                  title: "Pending Payouts",
                  value: `$${investments
                    .filter((i) => i.status === "active" && i.payoutStatus === "pending")
                    .reduce((sum, i) => sum + i.expectedReturn, 0)
                    .toLocaleString()}`,
                  color: "text-green-400",
                },
              ].map((stat, index) => (
                <div key={index} className="p-4 rounded-lg bg-slate-800/50">
                  <div className="text-white/70 text-sm mb-1">{stat.title}</div>
                  <div className={`text-xl font-medium ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </AdminLayout>
  )
}

