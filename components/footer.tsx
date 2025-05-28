"use client"

import { motion } from "framer-motion"

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative border-t border-white/5"
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-blue-100/50"
        >
          <p>© 2024 CoinOrbit. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  )
}
