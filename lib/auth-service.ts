import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  type User,
} from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  updateDoc,
} from "firebase/firestore"
import { auth, db } from "./firebase"
import { Timestamp } from "firebase/firestore"

// Add this function at the top of the file
const generateReferralCode = (length = 8): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Add new interfaces for admin
interface AdminData {
  uid: string
  email: string
  fullName: string
  role: "admin"
  createdAt: any
  lastLogin: any
}

// Update the UserData interface to include referralCode and referralCount
interface UserData {
  uid: string
  email: string
  fullName: string
  createdAt: any
  lastLogin: any
  referralCode: string
  referralCount: number
  balance: number
  status: string
  referredBy?: string
}

// Add admin signup function
export const adminSignUp = async (email: string, password: string, fullName: string): Promise<User> => {
  try {
    // Validate email domain (optional: add your allowed domains)
    const allowedDomains = ["coinorbit.com", "admin.coinorbit.com"]
    const emailDomain = email.split("@")[1]

    if (!allowedDomains.includes(emailDomain)) {
      throw new Error("Invalid email domain for admin registration")
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create admin document in Firestore
    const adminData: AdminData = {
      uid: user.uid,
      email,
      fullName,
      role: "admin",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    }

    await setDoc(doc(db, "admins", user.uid), adminData)

    return user
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Add admin signin function
export const adminSignIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Verify if user is an admin
    const adminDoc = await getDoc(doc(db, "admins", user.uid))
    if (!adminDoc.exists()) {
      await signOut(auth) // Sign out if not an admin
      throw new Error("Unauthorized access")
    }

    // Update last login timestamp
    await setDoc(
      doc(db, "admins", user.uid),
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true },
    )

    return user
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Add function to check if user is admin
export const isAdmin = async (uid: string): Promise<boolean> => {
  try {
    const adminDoc = await getDoc(doc(db, "admins", uid))
    return adminDoc.exists()
  } catch (error) {
    return false
  }
}

// Update the signUp function to include referral code generation
export const signUp = async (email: string, password: string, fullName: string, referredBy?: string): Promise<User> => {
  try {
    // Create the authentication user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    const referralCode = generateReferralCode()

    // Create user document in Firestore
    const userData: UserData = {
      uid: user.uid,
      email,
      fullName,
      referralCode,
      referralCount: 0,
      balance: 0,
      status: "active",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    }

    // Add referredBy if provided
    if (referredBy) {
      userData.referredBy = referredBy
    }

    // Create the user document
    await setDoc(doc(db, "users", user.uid), userData)

    // If user was referred, increment referral count for referrer
    if (referredBy) {
      const referrerDoc = await getDoc(doc(db, "users", referredBy))
      if (referrerDoc.exists()) {
        await setDoc(
          doc(db, "users", referredBy),
          {
            referralCount: (referrerDoc.data().referralCount || 0) + 1,
          },
          { merge: true },
        )
      }
    }

    return user
  } catch (error: any) {
    console.error("Error in signUp:", error)
    throw new Error(error.message)
  }
}

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update last login timestamp
    await setDoc(
      doc(db, "users", user.uid),
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true },
    )

    return user
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Add function to get admin data
export const getAdminData = async (uid: string): Promise<AdminData | null> => {
  try {
    const adminDoc = await getDoc(doc(db, "admins", uid))
    if (adminDoc.exists()) {
      return adminDoc.data() as AdminData
    }
    return null
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    return null
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Update the createTransaction function to include status
export const createTransaction = async (userId: string, amount: number, type: "deposit" | "withdraw") => {
  try {
    const userRef = doc(db, "users", userId)
    const transactionRef = collection(userRef, "transactions")

    await addDoc(transactionRef, {
      amount,
      type,
      status: "pending", // Add status field with default "pending"
      timestamp: serverTimestamp(),
    })

    // Only update user's balance when transaction is approved
    // This will be handled by the admin approval process now

    return true
  } catch (error) {
    console.error("Error creating transaction:", error)
    throw error
  }
}

// Add function to get user transactions
export const getUserTransactions = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId)
    const transactionsRef = collection(userRef, "transactions")
    const q = query(transactionsRef, orderBy("timestamp", "desc"))

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting user transactions:", error)
    return []
  }
}

// Add this new function to create an investment
export const createInvestment = async (
  userId: string,
  planId: string,
  amount: number,
  roi: number,
  durationDays: number,
  expectedReturn: number,
  maturityDate: Date,
) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("User not authenticated")
    }

    // Check if the authenticated user's UID matches the userId in the path
    if (user.uid !== userId) {
      throw new Error("Unauthorized: User ID mismatch")
    }

    // Verify all required fields are present
    const requiredFields = ["planId", "amount", "roi", "durationDays", "expectedReturn", "maturityDate"]
    const investmentData = { planId, amount, roi, durationDays, expectedReturn, maturityDate }

    for (const field of requiredFields) {
      if (investmentData[field] === undefined || investmentData[field] === null) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Create reference to user's investments subcollection
    const userRef = doc(db, "users", userId)
    const investmentRef = collection(userRef, "investments")

    // Check if user has sufficient balance
    const userDoc = await getDoc(userRef)
    if (!userDoc.exists()) {
      throw new Error("User document not found")
    }

    const currentBalance = userDoc.data().balance || 0
    if (currentBalance < amount) {
      throw new Error("Insufficient balance")
    }

    // Add the investment document
    const newInvestment = await addDoc(investmentRef, {
      planId,
      amount,
      expectedReturn,
      roi,
      durationDays,
      status: "active",
      investmentDate: serverTimestamp(),
      maturityDate: Timestamp.fromDate(maturityDate),
      payoutStatus: "pending",
      reinvestment: false,
    })

    // Update user's balance - deduct the investment amount
    await updateDoc(userRef, {
      balance: currentBalance - amount,
    })

    // Create a transaction record for the investment
    const transactionRef = collection(userRef, "transactions")
    await addDoc(transactionRef, {
      amount,
      type: "investment",
      status: "completed",
      timestamp: serverTimestamp(),
      planId: planId,
      investmentId: newInvestment.id,
    })

    return true
  } catch (error) {
    console.error("Error creating investment:", error)
    throw error
  }
}

// Add this function to get user investments
export const getUserInvestments = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId)
    const investmentsRef = collection(userRef, "investments")
    const q = query(investmentsRef, orderBy("investmentDate", "desc"))

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting user investments:", error)
    return []
  }
}
