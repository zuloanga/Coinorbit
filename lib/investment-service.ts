import { db } from "./firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"

interface Investment {
  id: string
  planId: string
  amount: number
  roi: number
  startDate: Timestamp
  endDate: Timestamp
  status: "active" | "completed" | "cancelled"
  currentProfit: number
  totalProfit: number
  lastProfitUpdate: Timestamp
}

export const createInvestment = async (
  userId: string,
  planId: string,
  amount: number,
  roi: number,
  durationDays: number,
) => {
  try {
    // Get user document
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    // Check if user has sufficient balance
    const currentBalance = userDoc.data().balance || 0
    if (currentBalance < amount) {
      throw new Error("Insufficient balance")
    }

    // Check for active investment with same plan
    const investmentsRef = collection(db, "users", userId, "investments")
    const activeQuery = query(investmentsRef, where("planId", "==", planId), where("status", "==", "active"))
    const activeInvestments = await getDocs(activeQuery)

    if (!activeInvestments.empty) {
      throw new Error("You already have an active investment in this plan")
    }

    const startDate = Timestamp.now()
    const endDate = Timestamp.fromDate(new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000))

    // Create investment document
    const investment = {
      planId,
      amount,
      roi,
      startDate,
      endDate,
      status: "active",
      currentProfit: 0,
      totalProfit: (amount * roi) / 100,
      lastProfitUpdate: startDate,
    }

    // Add investment and update user balance in a transaction
    const newInvestmentRef = await addDoc(investmentsRef, investment)

    // Update user balance
    await updateDoc(userRef, {
      balance: currentBalance - amount,
    })

    // Create transaction record
    const transactionsRef = collection(db, "users", userId, "transactions")
    await addDoc(transactionsRef, {
      type: "investment",
      amount,
      planId,
      investmentId: newInvestmentRef.id,
      timestamp: serverTimestamp(),
      status: "completed",
    })

    return {
      success: true,
      investmentId: newInvestmentRef.id,
    }
  } catch (error: any) {
    console.error("Error creating investment:", error)
    throw new Error(error.message)
  }
}

export const calculateROI = async (userId: string, investmentId: string) => {
  try {
    const investmentRef = doc(db, "users", userId, "investments", investmentId)
    const investmentDoc = await getDoc(investmentRef)

    if (!investmentDoc.exists()) {
      throw new Error("Investment not found")
    }

    const investment = investmentDoc.data() as Investment

    // If investment is not active, return current profit
    if (investment.status !== "active") {
      return investment.currentProfit
    }

    const now = Timestamp.now()
    const startDate = investment.startDate
    const endDate = investment.endDate
    const lastUpdate = investment.lastProfitUpdate

    // Calculate time elapsed since last update
    const elapsedSeconds = now.seconds - lastUpdate.seconds
    const totalDuration = endDate.seconds - startDate.seconds

    // Calculate daily profit rate
    const dailyProfit = (investment.amount * investment.roi) / ((100 * totalDuration) / 86400)

    // Calculate new profit
    const newProfit = investment.currentProfit + (dailyProfit * elapsedSeconds) / 86400

    // Cap profit at total expected profit
    const finalProfit = Math.min(newProfit, investment.totalProfit)

    // Update investment with new profit
    await updateDoc(investmentRef, {
      currentProfit: finalProfit,
      lastProfitUpdate: now,
      ...(finalProfit >= investment.totalProfit ? { status: "completed" } : {}),
    })

    // If investment is completed, add profit to user balance
    if (finalProfit >= investment.totalProfit) {
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const currentBalance = userDoc.data().balance || 0
        await updateDoc(userRef, {
          balance: currentBalance + investment.amount + investment.totalProfit,
        })

        // Create profit transaction record
        const transactionsRef = collection(db, "users", userId, "transactions")
        await addDoc(transactionsRef, {
          type: "profit",
          amount: investment.totalProfit,
          investmentId,
          planId: investment.planId,
          timestamp: serverTimestamp(),
          status: "completed",
        })
      }
    }

    return finalProfit
  } catch (error: any) {
    console.error("Error calculating ROI:", error)
    throw new Error(error.message)
  }
}

// Update the getInvestmentStats function
export const getInvestmentStats = async (userId: string) => {
  try {
    const investmentsRef = collection(db, "users", userId, "investments")
    const investmentsSnapshot = await getDocs(investmentsRef)

    let totalInvested = 0
    let totalProfit = 0
    let activeInvestments = 0
    let totalReturn = 0 // Total amount returned from completed investments

    investmentsSnapshot.forEach((doc) => {
      const investment = doc.data()
      totalInvested += investment.amount

      if (investment.status === "active") {
        activeInvestments++
        totalProfit += investment.currentProfit || 0
      } else if (investment.status === "completed") {
        // Add the total profit from completed investments
        totalProfit += investment.totalProfit || 0
        totalReturn += investment.amount + (investment.totalProfit || 0)
      }
    })

    // Calculate actual ROI as percentage gain from investments
    const actualROI = totalInvested > 0 ? ((totalReturn + totalProfit - totalInvested) / totalInvested) * 100 : 0

    return {
      totalInvested,
      totalProfit,
      activeInvestments,
      roi: actualROI,
    }
  } catch (error: any) {
    console.error("Error getting investment stats:", error)
    throw new Error(error.message)
  }
}

// Add a function to get remaining time
export const getRemainingTime = (endDate: Date): string => {
  const now = new Date()
  const diff = endDate.getTime() - now.getTime()

  if (diff <= 0) return "Completed"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days}d ${hours}h remaining`
  }
  return `${hours}h remaining`
}
