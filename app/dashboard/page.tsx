"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Timer,
  TrendingUp,
  DollarSign,
  Calendar,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/firebase"
import { getUserData, getUserTransactions, getUserInvestments } from "@/lib/auth-service"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Loader } from "@/components/ui/loader"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InvestmentCard } from "@/components/investment-card"
import Particles from "@/components/particles"

const cardStyles = {
  wrapper: "bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/5",
  hoverEffect: "transition-transform transform hover:scale-105",
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<any[]>([])
  const [investments, setInvestments] = useState<any[]>([])
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const [data, transactions, investmentsData] = await Promise.all([
            getUserData(user.uid),
            getUserTransactions(user.uid),
            getUserInvestments(user.uid),
          ])

          if (data && data.balance === undefined) {
            data.balance = 0
          }
          setUserData(data)
          setTransactions(transactions || [])
          setInvestments(investmentsData || [])
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    const timer = setInterval(() => {
      setInvestments((prevInvestments) =>
        prevInvestments.map((investment) => {
          if (investment.status === "active" && investment.investmentDate && investment.maturityDate) {
            const now = new Date()
            const startDate = investment.investmentDate.toDate()
            const endDate = investment.maturityDate.toDate()
            const totalDuration = endDate.getTime() - startDate.getTime()
            const elapsedDuration = now.getTime() - startDate.getTime()
            const progress = Math.min(elapsedDuration / totalDuration, 1)
            const currentProfit = progress * (investment.expectedReturn - investment.amount)
            return { ...investment, currentProfit }
          }
          return investment
        }),
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${userData.referralCode}`
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-[50vh]">
            <Loader size="large" />
          </div>
        </main>
      </AuthenticatedLayout>
    )
  }

  if (!userData) {
    return (
      <AuthenticatedLayout>
        <main className="container mx-auto px-4 py-8">
          <div className="text-white text-center">Error loading user data. Please try again.</div>
        </main>
      </AuthenticatedLayout>
    )
  }

  const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalProfit = investments.reduce((sum, inv) => sum + (inv.currentProfit || 0), 0)
  const roi = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100).toFixed(2) : "0.00"

  const stats = [
    {
      name: "Balance",
      value: `$${userData.balance.toFixed(2)}`,
      icon: Wallet,
      iconColor: "text-green-400",
      iconBg: "bg-green-400/10",
    },
    {
      name: "Active Investments",
      value: investments.filter((inv) => inv.status === "active").length.toString(),
      icon: DollarSign,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-400/10",
    },
    {
      name: "ROI",
      value: `${roi}%`,
      icon: Timer,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-400/10",
    },
  ]

  function getRemainingTime(maturityDate: Date | undefined) {
    if (!maturityDate) return "N/A"
    const now = new Date()
    const difference = maturityDate.getTime() - now.getTime()

    if (difference <= 0) {
      return "Matured!"
    }

    const days = Math.floor(difference / (1000 * 3600 * 24))
    const hours = Math.floor((difference % (1000 * 3600 * 24)) / (1000 * 3600))
    const minutes = Math.floor((difference % (1000 * 3600)) / (1000 * 60))

    return `${days}d ${hours}h ${minutes}m`
  }

  function getProgressPercentage(startDate: Date | undefined, endDate: Date | undefined) {
    if (!startDate || !endDate) return 0
    const now = new Date()
    const total = endDate.getTime() - startDate.getTime()
    const elapsed = now.getTime() - startDate.getTime()
    const percentage = (elapsed / total) * 100
    return Math.min(Math.max(percentage, 0), 100)
  }

  return (
    <AuthenticatedLayout>
      <div className="fixed inset-0 z-10">
        <Particles
          className="w-full h-full"
          particleCount={300}
          particleSpread={40}
          speed={0.2}
          moveParticlesOnHover={true}
          particleColors={["#4338ca", "#3b82f6", "#60a5fa"]}
        />
      </div>
      <main className="container relative z-20 mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-white mb-6 [text-shadow:_0_0_30px_rgb(29_78_216_/_0.2)]">
            Welcome back, {userData?.fullName}
          </h1>

          <div className="mb-8">
            <InvestmentCard totalInvestment={totalInvestment} totalProfit={totalProfit} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${cardStyles.wrapper} ${cardStyles.hoverEffect} p-6`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">{stat.name}</div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    {stat.name === "Balance" && (
                      <div className="text-sm text-white/50">Total: ${(userData.balance + totalProfit).toFixed(2)}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`${cardStyles.wrapper} ${cardStyles.hoverEffect} p-6`}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((transaction, index) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-lg ${
                            transaction.type === "deposit" ? "bg-green-500/20" : "bg-red-500/20"
                          } mr-3`}
                        >
                          {transaction.type === "deposit" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {transaction.type === "deposit" ? "Deposit" : "Withdrawal"}
                          </div>
                          <div className="text-white/70 text-sm">
                            {new Date(transaction.timestamp?.toDate()).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={transaction.type === "deposit" ? "text-green-400" : "text-red-400"}>
                          {transaction.type === "deposit" ? "+" : "-"}${transaction.amount}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : transaction.status === "approved"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-white/50 py-4">No transactions yet</div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className={`${cardStyles.wrapper} ${cardStyles.hoverEffect} p-6`}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Active Investments</h2>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader size="medium" />
                  </div>
                ) : (
                  <>
                    {investments.length > 0 ? (
                      investments
                        .filter((inv) => inv.status === "active")
                        .map((investment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-white/5 hover:border-white/10 transition-colors"
                          >
                            <div className="flex-grow">
                              <div className="font-medium text-white">
                                {investment.planId.replace("_", " ").toUpperCase()}
                              </div>
                              <div className="text-sm text-white/70">
                                Started:{" "}
                                {investment.investmentDate
                                  ? new Date(investment.investmentDate.toDate()).toLocaleDateString()
                                  : "N/A"}
                              </div>
                              <div className="text-sm text-blue-400 mt-1">
                                Remaining:{" "}
                                {investment.maturityDate ? getRemainingTime(investment.maturityDate.toDate()) : "N/A"}
                              </div>
                              <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-2">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${getProgressPercentage(
                                      investment.investmentDate?.toDate(),
                                      investment.maturityDate?.toDate(),
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-4">
                              <div>
                                <div className="text-green-400">${investment.amount}</div>
                                <div className="text-sm text-white/70">
                                  Profit: ${(investment.currentProfit || 0).toFixed(2)}
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                  <MoreVertical className="w-5 h-5 text-white/70" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedInvestment(investment)
                                      setShowDetailsDialog(true)
                                    }}
                                  >
                                    View Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center text-white/50 py-8">
                        <div className="mb-2">No active investments</div>
                        <Link
                          href="/invest"
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          View investment plans
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className={`${cardStyles.wrapper} ${cardStyles.hoverEffect} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Your Referral Link</h2>
              <Link href="/referral" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                View Referral Program
              </Link>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-slate-800/50 rounded-xl border border-white/5 text-white font-mono text-sm truncate">
                {`${window.location.origin}/signup?ref=${userData.referralCode}`}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyReferralLink}
                className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/50 text-white hover:bg-blue-500/20 transition-colors duration-200"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </motion.button>
            </div>
          </motion.div>

          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border border-white/10">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-white">Investment Details</DialogTitle>
              </DialogHeader>
              {selectedInvestment && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`${cardStyles.wrapper} p-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-white/70">Amount</span>
                      </div>
                      <div className="text-lg font-semibold text-white">${selectedInvestment.amount}</div>
                    </div>
                    <div className={`${cardStyles.wrapper} p-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white/70">Profit</span>
                      </div>
                      <div className="text-lg font-semibold text-white">
                        ${(selectedInvestment.currentProfit || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className={`${cardStyles.wrapper} p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-white/70">Duration</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-white/70">Started:</span>
                        <span className="text-white ml-2">
                          {selectedInvestment.investmentDate
                            ? new Date(selectedInvestment.investmentDate.toDate()).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-white/70">Ends:</span>
                        <span className="text-white ml-2">
                          {selectedInvestment.maturityDate
                            ? new Date(selectedInvestment.maturityDate.toDate()).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`${cardStyles.wrapper} p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-white/70">Time Remaining</span>
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {selectedInvestment.status === "active" && selectedInvestment.maturityDate
                        ? getRemainingTime(selectedInvestment.maturityDate.toDate())
                        : "N/A"}
                    </div>
                    {selectedInvestment.status === "active" &&
                      selectedInvestment.investmentDate &&
                      selectedInvestment.maturityDate && (
                        <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${getProgressPercentage(
                                selectedInvestment.investmentDate.toDate(),
                                selectedInvestment.maturityDate.toDate(),
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                  </div>

                  <div className={`${cardStyles.wrapper} p-4`}>
                    <div className="text-sm text-white/70 mb-2">Status</div>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        selectedInvestment.status === "active"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-green-500/10 text-green-400"
                      }`}
                    >
                      {selectedInvestment.status.charAt(0).toUpperCase() + selectedInvestment.status.slice(1)}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>
      </main>
    </AuthenticatedLayout>
  )
}
