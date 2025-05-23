"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Particles from "@/components/particles"
import { resetPassword } from "@/lib/auth-service"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    try {
      await resetPassword(email)
      toast.success("Password reset link has been sent to your email address.")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
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
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="absolute top-8 left-8 text-white hover:text-blue-400 transition-colors duration-200">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8 bg-slate-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-xl"
        >
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-white">Reset your password</h2>
            <p className="mt-2 text-center text-sm text-blue-100/70">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full rounded-lg border-0 bg-slate-800/50 p-3 text-white placeholder-gray-400 focus:z-10 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg px-4 py-3 text-sm font-medium text-white
                bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 backdrop-blur-md
                shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]
                hover:from-blue-500 hover:to-indigo-500 border border-blue-400/50
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </motion.button>
            </div>
          </form>
          <div className="text-center">
            <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Back to login
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}

