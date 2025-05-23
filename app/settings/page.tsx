"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Key, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/firebase"
import { getUserData } from "@/lib/auth-service"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { cardStyles, buttonStyles, inputStyles } from "@/lib/styles"
import { Loader } from "@/components/ui/loader"
import { toast } from "sonner"

export default function SettingsPage() {
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // Form state
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const data = await getUserData(user.uid)
          setUserData(data)
          setFullName(data?.fullName || "")
          setEmail(data?.email || "")
        } catch (error) {
          console.error("Error fetching user data:", error)
          toast.error("Failed to load user data")
        } finally {
          setIsLoading(false)
        }
      } else {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const user = auth.currentUser
      if (!user) throw new Error("No authenticated user")

      // Update profile in Firebase Auth
      await user.updateProfile({
        displayName: fullName,
      })

      // Update email if changed
      if (email !== user.email) {
        await user.updateEmail(email)
      }

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("New passwords do not match")
        }
        await user.updatePassword(newPassword)
      }

      toast.success("Profile updated successfully")

      // Clear password fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile", {
        description: error.message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader size="large" />
        </div>
      </AuthenticatedLayout>
    )
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
              <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Profile Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-white/70 mb-2">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={inputStyles.base}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputStyles.base}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Change Password
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-white/70 mb-2">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={inputStyles.base}
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-white/70 mb-2">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputStyles.base}
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputStyles.base}
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSaving}
                  className={`w-full ${buttonStyles.primary}`}
                >
                  {isSaving ? <Loader size="small" /> : "Save Changes"}
                </motion.button>
              </form>
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 text-yellow-500 text-sm">
              <p className="font-medium mb-2">Security Notice:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You will be logged out after changing your password</li>
                <li>Make sure to use a strong password with at least 8 characters</li>
                <li>Include numbers, symbols, and both uppercase and lowercase letters</li>
                <li>Keep your login credentials secure and never share them</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </main>
    </AuthenticatedLayout>
  )
}

