"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Check, Bitcoin, Wallet2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/firebase"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { cardStyles, buttonStyles, inputStyles } from "@/lib/styles"
import { Loader } from "@/components/ui/loader"
import { toast } from "sonner"
import { createTransaction } from "@/lib/auth-service"

interface CryptoOption {
  name: string
  symbol: string
  address: string
  icon: typeof Bitcoin
  network?: string
}

const cryptoOptions: CryptoOption[] = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    address: "bc1q6jllvq9gtvjxcjtv46z0489zwhp28n52g2x6h7",
    icon: Bitcoin,
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    address: "0x4278135FA27fe4b955c871e77cAe16B4CF4f9bCa",
    icon: Wallet2,
  },
  {
    name: "USDT",
    symbol: "USDT",
    address: "TEA6868i2fTr93rKy73VJpLd7LTvcnYx69",
    icon: Wallet2,
    network: "TRC20",
  },
]

export default function DepositPage() {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(cryptoOptions[0])
  const [copied, setCopied] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [depositAmount, setDepositAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(selectedCrypto.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // Update the handleSubmit function to show pending status
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("User not authenticated")
      }

      await createTransaction(user.uid, Number.parseFloat(depositAmount), "deposit")

      toast.success("Deposit request submitted!", {
        description: "Your deposit will be processed by an admin shortly.",
      })
      setTxHash("")
      setDepositAmount("")
    } catch (err) {
      console.error("Error processing deposit:", err)
      toast.error("Failed to process deposit", {
        description: "Please try again or contact support if the issue persists.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthenticatedLayout>
      <main className="container mx-auto px-4 py-8">
        {isSubmitting ? (
          <div className="flex justify-center items-center h-[50vh]">
            <Loader size="large" />
          </div>
        ) : (
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
                <h1 className="text-2xl font-bold text-white mb-6">Deposit Crypto</h1>

                {/* Crypto Options */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {cryptoOptions.map((crypto) => (
                    <motion.button
                      key={crypto.symbol}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCrypto(crypto)}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        selectedCrypto.symbol === crypto.symbol
                          ? "border-blue-500/50 bg-blue-500/10"
                          : "border-white/5 hover:border-white/20"
                      }`}
                    >
                      <crypto.icon className="w-6 h-6 text-white mb-2 mx-auto" />
                      <div className="text-white font-medium text-sm">{crypto.symbol}</div>
                    </motion.button>
                  ))}
                </div>

                {/* Form Content */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Deposit Address ({selectedCrypto.symbol})
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-grow p-3 bg-slate-800/50 rounded-xl border border-white/5 text-white break-all">
                        {selectedCrypto.address}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyToClipboard}
                        className={`p-3 rounded-xl ${buttonStyles.secondary}`}
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </motion.button>
                    </div>
                    {selectedCrypto.network && (
                      <p className="mt-2 text-yellow-500 text-sm">
                        Important: Only send via {selectedCrypto.network} network
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-xl">
                      <QRCodeSVG value={selectedCrypto.address} size={180} />
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="depositAmount" className="block text-white/70 text-sm mb-2">
                        Deposit Amount ({selectedCrypto.symbol})
                      </label>
                      <input
                        id="depositAmount"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder={`Enter amount in ${selectedCrypto.symbol}`}
                        className={inputStyles.base}
                        required
                        step="any"
                        min="0"
                      />
                    </div>

                    <div>
                      <label htmlFor="txHash" className="block text-white/70 text-sm mb-2">
                        Transaction Hash
                      </label>
                      <input
                        id="txHash"
                        type="text"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        placeholder="Enter your transaction hash for verification"
                        className={inputStyles.base}
                        required
                      />
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500">{error}</div>
                    )}
                    {success && (
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-500">
                        {success}
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isSubmitting || !txHash || !depositAmount}
                      className={`w-full ${buttonStyles.primary} ${
                        isSubmitting || !txHash || !depositAmount ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? "Processing..." : "Submit Deposit"}
                    </motion.button>
                  </form>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 text-yellow-500 text-sm">
                <p className="font-medium mb-2">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Make sure to send only {selectedCrypto.symbol} to this address</li>
                  <li>Triple check the address before sending any funds</li>
                  <li>Minimum deposit amount: 0.001 {selectedCrypto.symbol}</li>
                  {selectedCrypto.network && <li>Only send via {selectedCrypto.network} network</li>}
                  <li>Deposits are credited after network confirmation</li>
                </ul>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </AuthenticatedLayout>
  )
}

