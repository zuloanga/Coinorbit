"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, Copy, Check, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/firebase"
import { getUserData } from "@/lib/auth-service"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { cardStyles, buttonStyles } from "@/lib/styles"

export default function ReferralPage() {
  const [userData, setUserData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const data = await getUserData(user.uid)
        setUserData(data)
      } else {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [router])

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

  if (!userData) {
    return <div>Loading...</div>
  }

  return (
    <AuthenticatedLayout>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/70 hover:text-blue-400 transition-colors duration-200 mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={`${cardStyles.wrapper} ${cardStyles.hoverEffect} p-6 mb-6`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Referral Program</h1>
                  <p className="text-white/70">Earn rewards by inviting your friends to CoinOrbit</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-white/70 mb-2">Your Referral Link</div>
                    <div className="flex gap-2">
                      <div className="flex-1 p-3 bg-slate-800/50 rounded-xl border border-white/5 text-white font-mono text-sm truncate">
                        {`${window.location.origin}/signup?ref=${userData.referralCode}`}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyReferralLink}
                        className={`p-3 rounded-xl ${buttonStyles.secondary}`}
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </motion.button>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-2">Referral Code</div>
                    <div className="inline-block px-4 py-2 bg-slate-800/50 rounded-xl border border-white/5 text-white font-mono">
                      {userData.referralCode}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-white/70 mb-2">Total Referrals</div>
                    <div className="text-3xl font-bold text-white">{userData.referralCount || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-2">Rewards Earned</div>
                    <div className="text-3xl font-bold text-green-400">$0.00</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">How it works</h3>
                    <p className="text-white/70 text-sm">
                      Share your referral link with friends. When they sign up and make their first investment, you'll
                      earn a 5% bonus on their initial deposit!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </AuthenticatedLayout>
  )
}
