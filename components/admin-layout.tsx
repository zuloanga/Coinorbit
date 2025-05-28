"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { isAdmin } from "@/lib/auth-service"
import { AdminNavbar } from "./admin-navbar"
import Particles from "./particles"
import { Loader } from "./ui/loader"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/admin/login")
        return
      }

      // Check if user is admin
      const adminStatus = await isAdmin(user.uid)
      if (!adminStatus) {
        router.push("/admin/login")
        return
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030712] relative">
      {/* Global background glow effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px]">
          <div className="w-full h-full bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow opacity-30" />
        </div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px]">
          <div className="w-full h-full bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-slow opacity-30" />
        </div>
      </div>

      {/* Particles */}
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

      {/* Content */}
      <div className="relative z-20">
        <AdminNavbar />
        <div className="pt-16">{children}</div>
      </div>
    </div>
  )
}
