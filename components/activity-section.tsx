"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { motion } from "framer-motion"

export function ActivitySection() {
  const activities = [
    {
      type: "investment",
      amount: "+$1,000.00",
      time: "2 minutes ago",
      title: "Bitcoin Investment",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-400/10",
      textColor: "text-emerald-400",
    },
    {
      type: "withdrawal",
      amount: "-$500.00",
      time: "5 minutes ago",
      title: "Ethereum Withdrawal",
      iconColor: "text-red-400",
      iconBg: "bg-red-400/10",
      textColor: "text-red-400",
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="relative">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-4">
          {["Recent Investments", "Recent Withdrawals"].map((title, index) => (
            <motion.div
              key={title}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="rounded-2xl border border-white/5 backdrop-blur-xl bg-slate-900/50"
            >
              <div className="p-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              </div>
              <div className="divide-y divide-white/5">
                {Array(5)
                  .fill(null)
                  .map((_, i) => {
                    const activity = activities[index === 0 ? 0 : 1]
                    return (
                      <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 * i }}
                        className="flex items-center justify-between p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${activity.iconBg}`}>
                            {index === 0 ? (
                              <ArrowUpRight className={`w-4 h-4 ${activity.iconColor}`} />
                            ) : (
                              <ArrowDownRight className={`w-4 h-4 ${activity.iconColor}`} />
                            )}
                          </div>
                          <div>
                            <div className="text-white text-sm">{activity.title}</div>
                            <div className="text-gray-400 text-xs">{activity.time}</div>
                          </div>
                        </div>
                        <div className={activity.textColor}>{activity.amount}</div>
                      </motion.div>
                    )
                  })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
