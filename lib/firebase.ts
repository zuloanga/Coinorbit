import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDqxIs5E4daSanTmM90wTopMXz2odlZPSQ",
  authDomain: "coinorbit-52b8f.firebaseapp.com",
  projectId: "coinorbit-52b8f",
  storageBucket: "coinorbit-52b8f.appspot.com",
  messagingSenderId: "64818562864",
  appId: "1:64818562864:web:2b2bc49ba68ef7c9fcaaf5",
  measurementId: "G-Q773P0DGEL",
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)
let analytics
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}

export { app, auth, db, analytics }
