"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Check, X, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { getAllTransactions, getPendingTransactions, approveTransaction, rejectTransaction } from "@/lib/admin-service"
import { cardStyles, buttonStyles, inputStyles } from "@/lib/styles"
import { Loader } from "@/components/ui/loader"
import { toast } from "sonner"
import { auth } from "@/lib/firebase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Transaction {
  id: string
  userId: string
  userEmail: string
  userName: string
  type: "deposit" | "withdraw"
  amount: number
  status: "pending" | "approved" | "rejected"
  timestamp: any
  processedAt?: any
  processedBy?: string
  rejectionReason?: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [viewMode, setViewMode] = useState<"all" | "pending">("pending")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [viewMode])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const data = viewMode === "pending" ? await getPendingTransactions() : await getAllTransactions()
      setTransactions(data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Failed to load transactions", {
        description: "Please check your connection and try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchTransactions()
      toast.success("Transactions refreshed successfully")
    } catch (error) {
      console.error("Error refreshing transactions:", error)
      toast.error("Failed to refresh transactions")
    } finally {
      setRefreshing(false)
    }
  }

  const handleApprove = async (transaction: Transaction) => {
    if (!transaction.userId || !transaction.id) {
      toast.error("Invalid transaction data")
      return
    }

    setProcessing(true)
    try {
      const adminUser = auth.currentUser
      if (!adminUser) {
        throw new Error("Admin not authenticated")
      }

      await approveTransaction(transaction.userId, transaction.id, adminUser.uid)

      // Update local state
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transaction.id
            ? { ...t, status: "approved", processedAt: new Date(), processedBy: adminUser.uid }
            : t,
        ),
      )

      toast.success(`${transaction.type === "deposit" ? "Deposit" : "Withdrawal"} approved successfully`, {
        description: `$${transaction.amount.toLocaleString()} has been ${transaction.type === "deposit" ? "added to" : "deducted from"} the user's balance.`,
      })

      // If we're in pending view mode, refresh the list
      if (viewMode === "pending") {
        fetchTransactions()
      }
    } catch (error) {
      console.error("Error approving transaction:", error)
      toast.error("Failed to approve transaction", {
        description: "Please try again or check the logs for more details.",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (transaction: Transaction, reason: string) => {
    if (!transaction.userId || !transaction.id) {
      toast.error("Invalid transaction data")
      return
    }

    setProcessing(true)
    try {
      const adminUser = auth.currentUser
      if (!adminUser) {
        throw new Error("Admin not authenticated")
      }

      await rejectTransaction(transaction.userId, transaction.id, adminUser.uid, reason)

      // Update local state
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transaction.id
            ? {
                ...t,
                status: "rejected",
                processedAt: new Date(),
                processedBy: adminUser.uid,
                rejectionReason: reason,
              }
            : t,
        ),
      )

      setSelectedTransaction(null)
      setRejectionReason("")
      toast.success(`${transaction.type === "deposit" ? "Deposit" : "Withdrawal"} rejected`, {
        description: "The user will be notified of the rejection.",
      })

      // If we're in pending view mode, refresh the list
      if (viewMode === "pending") {
        fetchTransactions()
      }
    } catch (error) {
      console.error("Error rejecting transaction:", error)
      toast.error("Failed to reject transaction", {
        description: "Please try again or check the logs for more details.",
      })
    } finally {
      setProcessing(false)
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userId?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesType = typeFilter === "all" || transaction.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

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
                Transactions
              </h1>
              <p className="text-blue-100/70 mt-1">Manage user deposits and withdrawals</p>
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
            {/* View Mode Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-white/5 bg-slate-900/50 p-1 w-full md:w-auto mb-4 md:mb-0">
              <button
                onClick={() => setViewMode("pending")}
                className={`px-4 py-2 rounded-lg transition-all duration-300 flex-1 md:flex-none ${
                  viewMode === "pending"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`px-4 py-2 rounded-lg transition-all duration-300 flex-1 md:flex-none ${
                  viewMode === "all"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                All Transactions
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by user..."
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
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("approved")}>Approved</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>Rejected</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`${buttonStyles.secondary} gap-2`}>
                <Filter className="w-4 h-4" />
                Type: {typeFilter === "all" ? "All" : typeFilter}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTypeFilter("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("deposit")}>Deposits</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("withdraw")}>Withdrawals</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Transactions Table */}
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
                    <th className="p-4">Type</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="text-white hover:bg-white/5">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{transaction.userName}</div>
                            <div className="text-sm text-white/70">{transaction.userEmail}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-2 rounded-lg ${
                                transaction.type === "deposit" ? "bg-green-500/20" : "bg-red-500/20"
                              }`}
                            >
                              {transaction.type === "deposit" ? (
                                <ArrowUpRight className="w-4 h-4 text-green-400" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </td>
                        <td className="p-4">${transaction.amount.toLocaleString()}</td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === "pending"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : transaction.status === "approved"
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="p-4 text-white/70">
                          {transaction.timestamp?.toDate
                            ? transaction.timestamp.toDate().toLocaleDateString()
                            : "Unknown"}
                        </td>
                        <td className="p-4">
                          {transaction.status === "pending" ? (
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleApprove(transaction)}
                                disabled={processing}
                                className="p-2 rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20"
                              >
                                <Check className="w-5 h-5" />
                              </motion.button>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20"
                                    onClick={() => setSelectedTransaction(transaction)}
                                  >
                                    <X className="w-5 h-5" />
                                  </motion.button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white">
                                  <DialogHeader>
                                    <DialogTitle>Reject Transaction</DialogTitle>
                                    <DialogDescription className="text-white/70">
                                      Please provide a reason for rejecting this transaction.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <textarea
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Enter rejection reason..."
                                      className={`${inputStyles.base} min-h-[100px]`}
                                    />
                                    <div className="flex justify-end gap-4">
                                      <button
                                        onClick={() => {
                                          setSelectedTransaction(null)
                                          setRejectionReason("")
                                        }}
                                        className={buttonStyles.secondary}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (selectedTransaction) {
                                            handleReject(selectedTransaction, rejectionReason)
                                          }
                                        }}
                                        disabled={!rejectionReason.trim() || processing}
                                        className="px-6 py-2 text-white font-medium rounded-xl transition-all duration-300
                                        bg-gradient-to-r from-red-600 to-pink-600 backdrop-blur-md
                                        shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]
                                        hover:from-red-500 hover:to-pink-500 border border-red-400/50
                                        disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        Reject Transaction
                                      </button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          ) : (
                            <div className="text-white/50 text-sm">
                              {transaction.status === "approved" ? "Approved" : "Rejected"}
                              {transaction.processedAt?.toDate
                                ? ` on ${transaction.processedAt.toDate().toLocaleDateString()}`
                                : ""}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Search className="w-6 h-6 text-blue-400" />
                          </div>
                          <p className="text-white font-medium">No transactions found</p>
                          <p className="text-white/50 text-sm">
                            {viewMode === "pending"
                              ? "There are no pending transactions to approve."
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
        </motion.div>
      </main>
    </AdminLayout>
  )
}
