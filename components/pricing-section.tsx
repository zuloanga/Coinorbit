"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { getUserData, createInvestment } from "@/lib/auth-service"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader } from "@/components/ui/loader"
import { buttonStyles } from "@/lib/styles"

interface Plan {
  id: string
  name: string
  description: string
  minAmount: number
  roi: number
  duration: number
  features: string[]
  recommended?: boolean
}

export function PricingSection() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser
      if (user) {
        const data = await getUserData(user.uid)
        setUserData(data)
      }
    }

    fetchUserData()
  }, [])

  const plans: Plan[] = [
    {
      id: "starter_plan",
      name: "Starter Plan",
      description: "Perfect for beginners looking to start their investment journey",
      minAmount: 500,
      roi: 5,
      duration: 7,
      features: ["5% ROI in 7 days", "Minimum deposit: $500", "24/7 Support", "Basic AI analysis", "Weekly reports"],
    },
    {
      id: "growth_plan",
      name: "Growth Plan",
      description: "Designed for investors seeking steady growth and higher returns",
      minAmount: 2500,
      roi: 15,
      duration: 14,
      features: [
        "15% ROI in 14 days",
        "Minimum deposit: $2,500",
        "Priority support",
        "Advanced AI analysis",
        "Daily reports",
        "Portfolio diversification",
      ],
      recommended: true,
    },
    {
      id: "premium_plan",
      name: "Premium Plan",
      description: "Our highest tier for serious investors seeking maximum returns",
      minAmount: 10000,
      roi: 30,
      duration: 30,
      features: [
        "30% ROI in 30 days",
        "Minimum deposit: $10,000",
        "VIP support",
        "Premium AI analysis",
        "Real-time reports",
        "Custom investment strategies",
        "Personal investment advisor",
      ],
    },
  ]

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setShowConfirmation(true)
  }

  const handleConfirmInvestment = async () => {
    if (!selectedPlan) return

    try {
      setIsProcessing(true)
      const user = auth.currentUser

      if (!user) {
        toast.error("You must be logged in to invest")
        router.push("/login")
        return
      }

      // Get user data to check balance
      if (!userData) {
        toast.error("Unable to retrieve user data")
        return
      }

      if ((userData.balance || 0) < selectedPlan.minAmount) {
        toast.error("Insufficient balance", {
          description: `You need at least $${selectedPlan.minAmount} to invest in this plan. Please deposit funds.`,
        })
        return
      }

      // Calculate expected return and maturity date
      const expectedReturn = selectedPlan.minAmount + (selectedPlan.minAmount * selectedPlan.roi) / 100
      const maturityDate = new Date(Date.now() + selectedPlan.duration * 24 * 60 * 60 * 1000)

      // Create the investment with all required fields
      await createInvestment(
        user.uid,
        selectedPlan.id,
        selectedPlan.minAmount,
        selectedPlan.roi,
        selectedPlan.duration,
        expectedReturn,
        maturityDate,
      )

      toast.success("Investment successful!", {
        description: `Your ${selectedPlan.name} plan is now active. You can track it in your dashboard.`,
      })

      setShowConfirmation(false)

      // Redirect to dashboard after successful investment
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error: any) {
      console.error("Investment error:", error)
      const errorMessage = "There was an error processing your investment. Please try again."
      toast.error("Investment failed", {
        description: errorMessage,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="relative">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-white/90 mb-4 [text-shadow:_0_0_30px_rgb(29_78_216_/_0.2)]">
            Investment Plans
          </h2>
          <p className="text-blue-100/70 text-base max-w-2xl mx-auto">
            Choose the investment plan that best suits your financial goals
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`rounded-2xl p-6 border backdrop-blur-xl bg-slate-900/50 transition-all duration-300 flex flex-col
              ${plan.recommended ? "border-blue-500/50 ring-2 ring-blue-500/20" : "border-white/5"}`}
            >
              {plan.recommended && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full self-start mb-4">
                  Recommended
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">{plan.roi}%</span>
                <span className="text-gray-400 ml-1">ROI</span>
                <p className="text-sm text-gray-400">in {plan.duration} days</p>
              </div>
              <div className="text-lg font-semibold text-white mb-6">Min: ${plan.minAmount.toLocaleString()}</div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-400 mr-2 shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectPlan(plan)}
                className={`mt-auto w-full ${buttonStyles.primary} flex items-center justify-center gap-2`}
              >
                <Sparkles className="w-4 h-4" />
                Invest Now
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Investment Confirmation Dialog */}
      {showConfirmation && selectedPlan && (
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Confirm Investment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">Plan:</span>
                  <span className="text-white font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Investment Amount:</span>
                  <span className="text-white font-medium">${selectedPlan.minAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">ROI:</span>
                  <span className="text-white font-medium">{selectedPlan.roi}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Duration:</span>
                  <span className="text-white font-medium">{selectedPlan.duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Expected Return:</span>
                  <span className="text-green-400 font-medium">
                    ${(selectedPlan.minAmount + (selectedPlan.minAmount * selectedPlan.roi) / 100).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 text-yellow-500 text-sm">
                <p className="font-medium mb-2">Important Note:</p>
                <p>
                  By confirming this investment, ${selectedPlan.minAmount.toLocaleString()} will be deducted from your
                  balance. This investment will mature in {selectedPlan.duration} days.
                </p>
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className={buttonStyles.secondary}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirmInvestment}
                  disabled={isProcessing}
                  className={`${buttonStyles.primary} ${isProcessing ? "opacity-70" : ""}`}
                >
                  {isProcessing ? <Loader size="small" /> : "Confirm Investment"}
                </motion.button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  )
}

