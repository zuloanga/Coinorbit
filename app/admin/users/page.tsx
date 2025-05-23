"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, MoreVertical, Shield, Ban } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { getAllUsers, updateUserStatus } from "@/lib/admin-service"
import { cardStyles, buttonStyles, inputStyles } from "@/lib/styles"
import { Loader } from "@/components/ui/loader"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface User {
  id: string
  email: string
  fullName: string
  status: string
  balance: number
  referralCode: string
  referralCount: number
  createdAt: {
    toDate: () => Date
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const usersData = await getAllUsers()
      // Ensure all required fields are present and have default values if needed
      const processedUsers = usersData.map((user) => ({
        id: user.id,
        email: user.email || "",
        fullName: user.fullName || "",
        status: user.status || "inactive",
        balance: typeof user.balance === "number" ? user.balance : 0,
        referralCode: user.referralCode || "",
        referralCount: typeof user.referralCount === "number" ? user.referralCount : 0,
        createdAt: user.createdAt || { toDate: () => new Date() },
      }))
      setUsers(processedUsers)
      setError(null)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      await updateUserStatus(userId, newStatus)
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
    } catch (error) {
      console.error("Error updating user status:", error)
      setError("Failed to update user status. Please try again.")
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.referralCode.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader size="large" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-500">{error}</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <div className="flex items-center gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputStyles.base} pl-10`}
                />
              </div>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`${buttonStyles.secondary} gap-2`}>
                  <Filter className="w-4 h-4" />
                  Filter Status
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("suspended")}>Suspended</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Users Table */}
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
                    <th className="p-4">Status</th>
                    <th className="p-4">Balance</th>
                    <th className="p-4">Referrals</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="text-white hover:bg-white/5">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-white/70">{user.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            user.status === "active" ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4">${user.balance.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>{user.referralCount}</span>
                          <span className="text-white/50 text-xs">({user.referralCode})</span>
                        </div>
                      </td>
                      <td className="p-4 text-white/70">{user.createdAt.toDate().toLocaleDateString()}</td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="w-5 h-5 text-white/70 hover:text-white" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(user.id, "active")} className="gap-2">
                              <Shield className="w-4 h-4" />
                              Activate User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(user.id, "suspended")}
                              className="gap-2 text-red-400"
                            >
                              <Ban className="w-4 h-4" />
                              Suspend User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

