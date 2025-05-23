"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Bitcoin, Wallet2, ArrowLeft, AlertCircle, X } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/firebase"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { cardStyles, buttonStyles, inputStyles } from "@/lib/styles"
import { toast } from "sonner"
import { createTransaction } from "@/lib/auth-service"

interface CryptoOption {
  name: string
  symbol: string
  icon: typeof Bitcoin
  network?: string
  addressPattern: RegExp
  minAmount: number
}

const cryptoOptions: CryptoOption[] = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    icon: Bitcoin,
    addressPattern: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/,
    minAmount: 0.01,
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    icon: Wallet2,
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
    minAmount: 0.1,
  },
  {
    name: "USDT",
    symbol: "USDT",
    icon: Wallet2,
    network: "TRC20",
    addressPattern: /^T[a-zA-Z0-9]{33}$/,
    minAmount: 200,
  },
]

const cryptoPrices = {
  BTC: 40000,
  ETH: 2200,
  USDT: 1,
}

export default function WithdrawPage() {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(cryptoOptions[0])
  const [amount, setAmount] = useState("")
  const [address, setAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const validateAddress = (address: string) => {
    return selectedCrypto.addressPattern.test(address)
  }

  const calculateUsdAmount = () => {
    const cryptoAmount = Number.parseFloat(amount) || 0
    return (cryptoAmount * cryptoPrices[selectedCrypto.symbol as keyof typeof cryptoPrices]).toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate amount
    const usdAmount = Number.parseFloat(calculateUsdAmount())
    if (usdAmount < 200) {
      toast.error("Invalid withdrawal amount", {
        description: "Minimum withdrawal amount is $200",
      })
      return
    }

    // Validate address
    if (!validateAddress(address)) {
      toast.error("Invalid wallet address", {
        description: `Please enter a valid ${selectedCrypto.symbol} address`,
      })
      return
    }

    setShowConfirmation(true)
  }

  // Update the confirmWithdrawal function to show pending status
  const confirmWithdrawal = async () => {
    setIsSubmitting(true)
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("User not authenticated")
      }

      const withdrawalAmount = Number.parseFloat(amount)

      await createTransaction(user.uid, withdrawalAmount, "withdraw")

      setShowConfirmation(false)
      setShowSuccess(true)
      toast.success("Withdrawal request submitted!", {
        description: "Your request will be reviewed by an admin shortly.",
      })
      // Reset form
      setAmount("")
      setAddress("")
    } catch (err) {
      console.error("Error processing withdrawal:", err)
      toast.error("Failed to process withdrawal", {
        description: "Please try again or contact support if the issue persists.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthenticatedLayout>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/70 hover:text-blue-400 transition-colors duration-200 mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={`${cardStyles.wrapper} ${cardStyles.hoverEffect} p-6 mb-6`}>
              <h1 className="text-2xl font-bold text-white mb-6">Withdraw Crypto</h1>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {cryptoOptions.map((crypto) => (
                  <motion.button
                    key={crypto.symbol}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedCrypto(crypto)
                      setAmount("")
                      setAddress("")
                      setError("")
                    }}
                    className={`p-4 rounded-xl border ${
                      selectedCrypto.symbol === crypto.symbol
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-white/5 hover:border-white/20"
                    } transition-all duration-200`}
                  >
                    <crypto.icon className="w-6 h-6 text-white mb-2 mx-auto" />
                    <div className="text-white font-medium text-sm">{crypto.symbol}</div>
                  </motion.button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block text-white/70 text-sm mb-2">
                    Amount ({selectedCrypto.symbol})
                  </label>
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      setError("")
                    }}
                    step="any"
                    placeholder={`Minimum ${selectedCrypto.minAmount} ${selectedCrypto.symbol}`}
                    className={inputStyles.base}
                    required
                  />
                  {amount && <div className="mt-2 text-white/50 text-sm">≈ ${calculateUsdAmount()} USD</div>}
                </div>

                <div>
                  <label htmlFor="address" className="block text-white/70 text-sm mb-2">
                    Withdrawal Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value)
                      setError("")
                    }}
                    placeholder={`Enter your ${selectedCrypto.symbol} address`}
                    className={inputStyles.base}
                    required
                  />
                  {selectedCrypto.network && (
                    <p className="mt-2 text-yellow-500 text-sm">
                      Important: Only use {selectedCrypto.network} network addresses
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500">{error}</div>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting || !amount || !address}
                  className={`w-full ${buttonStyles.primary} ${
                    isSubmitting || !amount || !address ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Request Withdrawal
                </motion.button>
              </form>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 text-yellow-500 text-sm">
              <p className="font-medium mb-2">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Minimum withdrawal amount: $200</li>
                <li>Withdrawals are processed within 24 hours</li>
                <li>Triple check your withdrawal address</li>
                {selectedCrypto.network && <li>Only withdraw to {selectedCrypto.network} network addresses</li>}
                <li>Withdrawal fees may apply</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowConfirmation(false)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`relative ${cardStyles.wrapper} p-6 max-w-md w-full`}
              >
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="absolute top-4 right-4 text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-white mb-4">Confirm Withdrawal</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-white/70">Amount:</span>
                    <span className="text-white">
                      {amount} {selectedCrypto.symbol} (${calculateUsdAmount()})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Address:</span>
                    <span className="text-white break-all">{address}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmWithdrawal}
                  disabled={isSubmitting}
                  className={`w-full ${buttonStyles.primary} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting ? "Processing..." : "Confirm Withdrawal"}
                </motion.button>
              </motion.div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`relative ${cardStyles.wrapper} p-6 max-w-md w-full text-center`}
              >
                <button
                  onClick={() => setShowSuccess(false)}
                  className="absolute top-4 right-4 text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Withdrawal Requested</h3>
                <p className="text-white/70 mb-6">
                  Your withdrawal request has been received and will be processed within 24 hours. You will receive an
                  email notification once the withdrawal is complete.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowSuccess(false)
                    router.push("/dashboard")
                  }}
                  className={buttonStyles.primary}
                >
                  Back to Dashboard
                </motion.button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </AuthenticatedLayout>
  )
}

