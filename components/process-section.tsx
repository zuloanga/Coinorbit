"use client"

import { UserPlus, Wallet, LineChart } from "lucide-react"
import { motion } from "framer-motion"

export function ProcessSection() {
  const steps = [
    {
      title: "Create Account",
      icon: UserPlus,
      description: "Sign up and verify your identity in minutes",
      iconColor: "text-pink-400",
      iconBg: "bg-pink-400/10",
    },
    {
      title: "Fund Your Wallet",
      icon: Wallet,
      description: "Deposit crypto or fiat securely",
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-400/10",
    },
    {
      title: "Start Investing",
      icon: LineChart,
      description: "Watch your balance grow with our automated AI system",
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-400/10",
    },
  ]

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
            Start Your Crypto Journey
          </h2>
          <p className="text-blue-100/70 text-base max-w-2xl mx-auto">
            Begin your investment journey with CoinOrbit in three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {steps.map(({ title, icon: Icon, description, iconColor, iconBg }, i) => (
            <motion.div
              key={i}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-start gap-4 rounded-2xl p-6 border border-white/5
              backdrop-blur-xl bg-slate-900/50 transition-all duration-300"
            >
              <div className={`p-3 rounded-xl ${iconBg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
