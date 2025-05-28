"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, X, Search } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { getPendingWithdrawals, approveWithdrawal, rejectWithdrawal } from "@/lib/admin-service"
import { cardStyles, buttonStyles, inputStyles } from "@/lib/styles"
import { Loader } from "@/components/ui/loader"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Withdrawal {
  id: string
  userId: string
  amount: number
  currency: string
  status: string
  requestDate: any
  userEmail: string
  walletAddress: string
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const fetchWithdrawals = async () => {
    try {
      const withdrawalsData = await getPendingWithdrawals()
      setWithdrawals(withdrawalsData)
    } catch (error) {
      console.error("Error fetching withdrawals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (withdrawal: Withdrawal) => {
    setProcessing(true)
    try {
      await approveWithdrawal(withdrawal.id, "admin-id") // Replace with actual admin ID
      setWithdrawals((prev) => prev.filter((w) => w.id !== withdrawal.id))
    } catch (error) {
      console.error("Error approving withdrawal:", error)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (withdrawal: Withdrawal, reason: string) => {
    setProcessing(true)
    try {
      await rejectWithdrawal(withdrawal.id, "admin-id", reason) // Replace with actual admin ID
      setWithdrawals((prev) => prev.filter((w) => w.id !== withdrawal.id))
      setSelectedWithdrawal(null)
      setRejectionReason("")
    } catch (error) {
      console.error("Error rejecting withdrawal:", error)
    } finally {
      setProcessing(false)
    }
  }

  const filteredWithdrawals = withdrawals.filter(
    (withdrawal) =>
      withdrawal.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
              <h1 className="text-3xl font-bold text-white">Withdrawal Requests</h1>
              <p className="text-white/70 mt-1">Manage pending withdrawal requests</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search withdrawals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputStyles.base} pl-10`}
                />
              </div>
            </div>
          </div>

          {/* Withdrawals Table */}
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
                    <th className="p-4">Amount</th>
                    <th className="p-4">Currency</th>
                    <th className="p-4">Wallet Address</th>
                    <th className="p-4">Request Date</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="text-white hover:bg-white/5">
                      <td className="p-4">
                        <div className="font-medium">{withdrawal.userEmail}</div>
                      </td>
                      <td className="p-4">${withdrawal.amount.toLocaleString()}</td>
                      <td className="p-4">{withdrawal.currency}</td>
                      <td className="p-4">
                        <div className="font-mono text-sm text-white/70">{withdrawal.walletAddress}</div>
                      </td>
                      <td className="p-4 text-white/70">{withdrawal.requestDate.toDate().toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApprove(withdrawal)}
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
                              >
                                <X className="w-5 h-5" />
                              </motion.button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Withdrawal</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting this withdrawal request.
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
                                      setSelectedWithdrawal(null)
                                      setRejectionReason("")
                                    }}
                                    className={buttonStyles.secondary}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleReject(withdrawal, rejectionReason)}
                                    disabled={!rejectionReason.trim() || processing}
                                    className={`${buttonStyles.primary} bg-red-500 hover:bg-red-600`}
                                  >
                                    Reject Withdrawal
                                  </button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </AdminLayout>
  )
}
