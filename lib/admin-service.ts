import { db } from "./firebase"
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  Timestamp,
  limit,
  getDoc,
  serverTimestamp,
} from "firebase/firestore"

interface WeeklyStats {
  currentWeek: number
  previousWeek: number
  percentageChange: string
}

// Platform Statistics
export const getPlatformStats = async () => {
  try {
    // Get current date and start of the week
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 7)

    // Get start of previous week
    const startOfPreviousWeek = new Date(startOfWeek)
    startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7)

    // Get all stats in parallel
    const [userStats, depositStats, investmentStats, withdrawalStats] = await Promise.all([
      getUserStats(startOfWeek, startOfPreviousWeek),
      getDepositStats(startOfWeek, startOfPreviousWeek),
      getInvestmentStats(startOfWeek),
      getWithdrawalStats(startOfWeek, startOfPreviousWeek),
    ])

    return {
      users: userStats,
      deposits: depositStats,
      investments: investmentStats,
      withdrawals: withdrawalStats,
    }
  } catch (error) {
    console.error("Error getting platform stats:", error)
    // Return default stats instead of throwing
    return {
      users: { currentWeek: 0, previousWeek: 0, percentageChange: "0" },
      deposits: { currentWeek: 0, previousWeek: 0, percentageChange: "0" },
      investments: { currentWeek: 0, previousWeek: 0, percentageChange: "0" },
      withdrawals: { currentWeek: 0, previousWeek: 0, percentageChange: "0" },
    }
  }
}

const getUserStats = async (startOfWeek: Date, startOfPreviousWeek: Date): Promise<WeeklyStats> => {
  try {
    const usersRef = collection(db, "users")

    // Get total users
    const totalUsersSnapshot = await getDocs(usersRef)
    const totalUsers = totalUsersSnapshot.size

    // Get users registered this week
    const thisWeekQuery = query(usersRef, where("createdAt", ">=", startOfWeek))
    const thisWeekSnapshot = await getDocs(thisWeekQuery)
    const thisWeekUsers = thisWeekSnapshot.size

    // Get users registered last week
    const lastWeekQuery = query(
      usersRef,
      where("createdAt", ">=", startOfPreviousWeek),
      where("createdAt", "<", startOfWeek),
    )
    const lastWeekSnapshot = await getDocs(lastWeekQuery)
    const lastWeekUsers = lastWeekSnapshot.size

    // Calculate percentage change
    const percentageChange =
      lastWeekUsers === 0 ? "+100" : (((thisWeekUsers - lastWeekUsers) / lastWeekUsers) * 100).toFixed(0)

    return {
      currentWeek: totalUsers,
      previousWeek: lastWeekUsers,
      percentageChange: `${percentageChange > 0 ? "+" : ""}${percentageChange}`,
    }
  } catch (error) {
    console.error("Error getting user stats:", error)
    return { currentWeek: 0, previousWeek: 0, percentageChange: "0" }
  }
}

const getDepositStats = async (startOfWeek: Date, startOfPreviousWeek: Date): Promise<WeeklyStats> => {
  try {
    const depositsRef = collection(db, "deposits")

    // Get total deposits
    const totalDepositsQuery = query(depositsRef, where("status", "==", "completed"))
    const totalDepositsSnapshot = await getDocs(totalDepositsQuery)
    const totalDeposits = totalDepositsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0)

    // Get deposits this week
    const thisWeekQuery = query(depositsRef, where("status", "==", "completed"), where("createdAt", ">=", startOfWeek))
    const thisWeekSnapshot = await getDocs(thisWeekQuery)
    const thisWeekDeposits = thisWeekSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0)

    // Get deposits last week
    const lastWeekQuery = query(
      depositsRef,
      where("status", "==", "completed"),
      where("createdAt", ">=", startOfPreviousWeek),
      where("createdAt", "<", startOfWeek),
    )
    const lastWeekSnapshot = await getDocs(lastWeekQuery)
    const lastWeekDeposits = lastWeekSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0)

    // Calculate percentage change
    const percentageChange =
      lastWeekDeposits === 0 ? "+100" : (((thisWeekDeposits - lastWeekDeposits) / lastWeekDeposits) * 100).toFixed(0)

    return {
      currentWeek: totalDeposits,
      previousWeek: lastWeekDeposits,
      percentageChange: `${percentageChange > 0 ? "+" : ""}${percentageChange}`,
    }
  } catch (error) {
    console.error("Error getting deposit stats:", error)
    return { currentWeek: 0, previousWeek: 0, percentageChange: "0" }
  }
}

const getInvestmentStats = async (startOfWeek: Date): Promise<WeeklyStats> => {
  try {
    const investmentsRef = collection(db, "investments")

    // Get total investments
    const totalQuery = query(investmentsRef)
    const totalSnapshot = await getDocs(totalQuery)
    const totalInvestments = totalSnapshot.size

    // Get new investments this week
    const newQuery = query(investmentsRef, where("startDate", ">=", startOfWeek))
    const newSnapshot = await getDocs(newQuery)
    const newInvestments = newSnapshot.size

    // Calculate percentage change
    const percentageChange = totalInvestments === 0 ? "+100" : ((newInvestments / totalInvestments) * 100).toFixed(0)

    return {
      currentWeek: totalInvestments,
      previousWeek: newInvestments,
      percentageChange: `+${percentageChange}`,
    }
  } catch (error) {
    console.error("Error getting investment stats:", error)
    // Return default values instead of throwing
    return { currentWeek: 0, previousWeek: 0, percentageChange: "0" }
  }
}

const getWithdrawalStats = async (startOfWeek: Date, startOfPreviousWeek: Date): Promise<WeeklyStats> => {
  try {
    const withdrawalsRef = collection(db, "withdrawals")

    // Get withdrawals this week
    const thisWeekQuery = query(
      withdrawalsRef,
      where("status", "==", "completed"),
      where("processedDate", ">=", startOfWeek),
    )
    const thisWeekSnapshot = await getDocs(thisWeekQuery)
    const thisWeekWithdrawals = thisWeekSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0)

    // Get withdrawals last week
    const lastWeekQuery = query(
      withdrawalsRef,
      where("status", "==", "completed"),
      where("processedDate", ">=", startOfPreviousWeek),
      where("processedDate", "<", startOfWeek),
    )
    const lastWeekSnapshot = await getDocs(lastWeekQuery)
    const lastWeekWithdrawals = lastWeekSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0)

    // Calculate percentage change
    const percentageChange =
      lastWeekWithdrawals === 0
        ? "+100"
        : (((thisWeekWithdrawals - lastWeekWithdrawals) / lastWeekWithdrawals) * 100).toFixed(0)

    return {
      currentWeek: thisWeekWithdrawals,
      previousWeek: lastWeekWithdrawals,
      percentageChange: `${percentageChange > 0 ? "+" : ""}${percentageChange}`,
    }
  } catch (error) {
    console.error("Error getting withdrawal stats:", error)
    return { currentWeek: 0, previousWeek: 0, percentageChange: "0" }
  }
}

// Recent Transactions
// Update the getRecentTransactions function to fetch from user transaction collections
export const getRecentTransactions = async (limitValue = 10) => {
  try {
    const usersRef = collection(db, "users")
    const usersSnapshot = await getDocs(usersRef)

    // Gather all transactions from all users
    const allTransactions = []

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id
      const userEmail = userDoc.data().email || "Unknown"
      const userName = userDoc.data().fullName || "Unknown User"

      const transactionsRef = collection(db, "users", userId, "transactions")
      const transactionsQuery = query(transactionsRef, orderBy("timestamp", "desc"))

      const transactionsSnapshot = await getDocs(transactionsQuery)

      transactionsSnapshot.docs.forEach((doc) => {
        allTransactions.push({
          id: doc.id,
          ...doc.data(),
          userId,
          userEmail,
          userName,
        })
      })
    }

    // Sort by timestamp descending and limit to requested number
    allTransactions.sort((a, b) => {
      const dateA = a.timestamp?.toDate?.() || new Date(0)
      const dateB = b.timestamp?.toDate?.() || new Date(0)
      return dateB - dateA
    })

    return allTransactions.slice(0, limitValue)
  } catch (error) {
    console.error("Error getting recent transactions:", error)
    return []
  }
}

// User Management
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users")
    const snapshot = await getDocs(usersRef)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting users:", error)
    return [] // Return empty array on error
  }
}

export const updateUserStatus = async (userId: string, status: string) => {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, { status })
    return true
  } catch (error) {
    console.error("Error updating user status:", error)
    throw error
  }
}

// Investment Plans
export const getInvestmentPlans = async () => {
  try {
    const plansSnapshot = await getDocs(collection(db, "investmentPlans"))
    return plansSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting investment plans:", error)
    throw error
  }
}

export const updateInvestmentPlan = async (planId: string, planData: any) => {
  try {
    const planRef = doc(db, "investmentPlans", planId)
    await updateDoc(planRef, planData)
    return true
  } catch (error) {
    console.error("Error updating investment plan:", error)
    throw error
  }
}

// Withdrawal Management
export const getPendingWithdrawals = async () => {
  try {
    const withdrawalsQuery = query(
      collection(db, "withdrawals"),
      where("status", "==", "pending"),
      orderBy("requestDate", "desc"),
    )
    const withdrawalsSnapshot = await getDocs(withdrawalsQuery)
    return withdrawalsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting pending withdrawals:", error)
    throw error
  }
}

export const approveWithdrawal = async (withdrawalId: string, adminId: string) => {
  try {
    const withdrawalRef = doc(db, "withdrawals", withdrawalId)
    await updateDoc(withdrawalRef, {
      status: "approved",
      processedDate: Timestamp.now(),
      processedBy: adminId,
    })
    return true
  } catch (error) {
    console.error("Error approving withdrawal:", error)
    throw error
  }
}

export const rejectWithdrawal = async (withdrawalId: string, adminId: string, reason: string) => {
  try {
    const withdrawalRef = doc(db, "withdrawals", withdrawalId)
    await updateDoc(withdrawalRef, {
      status: "rejected",
      processedDate: Timestamp.now(),
      processedBy: adminId,
      rejectionReason: reason,
    })
    return true
  } catch (error) {
    console.error("Error rejecting withdrawal:", error)
    throw error
  }
}

export const getUserInvestments = async (userId: string) => {
  try {
    const investmentsRef = collection(db, "investments")
    const q = query(investmentsRef, where("userId", "==", userId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting user investments:", error)
    return []
  }
}

// Get all transactions across all users
export const getAllTransactions = async (limitValue = 50) => {
  try {
    const usersRef = collection(db, "users")
    const usersSnapshot = await getDocs(usersRef)

    // Gather all transactions from all users
    const allTransactions = []

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id
      const userEmail = userDoc.data().email || "Unknown"
      const userName = userDoc.data().fullName || "Unknown User"

      const transactionsRef = collection(db, "users", userId, "transactions")
      const transactionsQuery = query(transactionsRef, orderBy("timestamp", "desc"), limit(limitValue))

      const transactionsSnapshot = await getDocs(transactionsQuery)

      transactionsSnapshot.docs.forEach((doc) => {
        allTransactions.push({
          id: doc.id,
          ...doc.data(),
          userId,
          userEmail,
          userName,
        })
      })
    }

    // Sort by timestamp descending and limit to requested number
    allTransactions.sort((a, b) => {
      const dateA = a.timestamp?.toDate?.() || new Date(0)
      const dateB = b.timestamp?.toDate?.() || new Date(0)
      return dateB - dateA
    })

    return allTransactions.slice(0, limitValue)
  } catch (error) {
    console.error("Error getting all transactions:", error)
    return []
  }
}

// Get pending transactions
export const getPendingTransactions = async () => {
  try {
    // Instead of using a collection group query which might be causing permission issues,
    // let's query the transactions collection directly
    const usersRef = collection(db, "users")
    const usersSnapshot = await getDocs(usersRef)

    // Gather all pending transactions from all users
    const pendingTransactions = []

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id
      const userEmail = userDoc.data().email || "Unknown"
      const userName = userDoc.data().fullName || "Unknown User"

      const transactionsRef = collection(db, "users", userId, "transactions")
      const pendingQuery = query(transactionsRef, where("status", "==", "pending"), orderBy("timestamp", "desc"))

      const transactionsSnapshot = await getDocs(pendingQuery)

      transactionsSnapshot.docs.forEach((doc) => {
        pendingTransactions.push({
          id: doc.id,
          ...doc.data(),
          userId,
          userEmail,
          userName,
        })
      })
    }

    // Sort by timestamp descending
    pendingTransactions.sort((a, b) => {
      const dateA = a.timestamp?.toDate?.() || new Date(0)
      const dateB = b.timestamp?.toDate?.() || new Date(0)
      return dateB - dateA
    })

    return pendingTransactions
  } catch (error) {
    console.error("Error getting pending transactions:", error)
    throw error
  }
}

// Approve a transaction
export const approveTransaction = async (userId: string, transactionId: string, adminId: string) => {
  try {
    const transactionRef = doc(db, "users", userId, "transactions", transactionId)
    const transactionDoc = await getDoc(transactionRef)

    if (!transactionDoc.exists()) {
      throw new Error("Transaction not found")
    }

    const transactionData = transactionDoc.data()
    const { type, amount } = transactionData

    // Update transaction status
    await updateDoc(transactionRef, {
      status: "approved",
      processedAt: serverTimestamp(),
      processedBy: adminId,
    })

    // Update user's balance
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const currentBalance = userDoc.data().balance || 0
    const newBalance = type === "deposit" ? currentBalance + amount : currentBalance - amount

    await updateDoc(userRef, { balance: newBalance })

    return true
  } catch (error) {
    console.error("Error approving transaction:", error)
    throw error
  }
}

// Reject a transaction
export const rejectTransaction = async (userId: string, transactionId: string, adminId: string, reason: string) => {
  try {
    const transactionRef = doc(db, "users", userId, "transactions", transactionId)

    await updateDoc(transactionRef, {
      status: "rejected",
      processedAt: serverTimestamp(),
      processedBy: adminId,
      rejectionReason: reason,
    })

    return true
  } catch (error) {
    console.error("Error rejecting transaction:", error)
    throw error
  }
}

// Add this new function to calculate total platform value
export const getTotalPlatformValue = async () => {
  try {
    const usersRef = collection(db, "users")
    const usersSnapshot = await getDocs(usersRef)

    let totalPlatformValue = 0

    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id

      // Get all transactions for this user
      const transactionsRef = collection(db, "users", userId, "transactions")
      const transactionsSnapshot = await getDocs(transactionsRef)

      // Sum up the transactions
      for (const transactionDoc of transactionsSnapshot.docs) {
        const transaction = transactionDoc.data()

        // Only count approved deposits, subtract approved withdrawals
        if (transaction.status === "approved") {
          if (transaction.type === "deposit") {
            totalPlatformValue += transaction.amount || 0
          } else if (transaction.type === "withdraw") {
            totalPlatformValue -= transaction.amount || 0
          }
        }
      }
    }

    return totalPlatformValue
  } catch (error) {
    console.error("Error calculating total platform value:", error)
    return 0 // Return 0 if there's an error
  }
}

// Add this function to get all investments across all users
export const getAllInvestments = async () => {
  try {
    const usersRef = collection(db, "users")
    const usersSnapshot = await getDocs(usersRef)

    // Gather all investments from all users
    const allInvestments = []

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id
      const userEmail = userDoc.data().email || "Unknown"
      const userName = userDoc.data().fullName || "Unknown User"

      const investmentsRef = collection(db, "users", userId, "investments")
      const investmentsQuery = query(investmentsRef, orderBy("investmentDate", "desc"))

      const investmentsSnapshot = await getDocs(investmentsQuery)

      investmentsSnapshot.docs.forEach((doc) => {
        allInvestments.push({
          id: doc.id,
          ...doc.data(),
          userId,
          userEmail,
          userName,
        })
      })
    }

    // Sort by investmentDate descending
    allInvestments.sort((a, b) => {
      const dateA = a.investmentDate?.toDate?.() || new Date(0)
      const dateB = b.investmentDate?.toDate?.() || new Date(0)
      return dateB - dateA
    })

    return allInvestments
  } catch (error) {
    console.error("Error getting all investments:", error)
    return []
  }
}

// Add this function to update investment status
export const updateInvestmentStatus = async (userId: string, investmentId: string, status: string) => {
  try {
    const investmentRef = doc(db, "users", userId, "investments", investmentId)
    await updateDoc(investmentRef, { status })
    return true
  } catch (error) {
    console.error("Error updating investment status:", error)
    throw error
  }
}

// Add this function to process investment payout
export const processInvestmentPayout = async (userId: string, investmentId: string, adminId: string) => {
  try {
    const investmentRef = doc(db, "users", userId, "investments", investmentId)
    const investmentDoc = await getDoc(investmentRef)

    if (!investmentDoc.exists()) {
      throw new Error("Investment not found")
    }

    const investmentData = investmentDoc.data()
    const { expectedReturn, payoutStatus } = investmentData

    if (payoutStatus !== "pending") {
      throw new Error("Investment already paid out")
    }

    // Update investment payout status
    await updateDoc(investmentRef, {
      payoutStatus: "completed",
      status: "completed",
      processedAt: serverTimestamp(),
      processedBy: adminId,
    })

    // Update user's balance
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const currentBalance = userDoc.data().balance || 0
    await updateDoc(userRef, {
      balance: currentBalance + expectedReturn,
    })

    return true
  } catch (error) {
    console.error("Error processing investment payout:", error)
    throw error
  }
}

