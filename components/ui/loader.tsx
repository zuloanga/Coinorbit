"use client"

import { motion } from "framer-motion"

interface LoaderProps {
  size?: "small" | "medium" | "large"
}

export function Loader({ size = "medium" }: LoaderProps) {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  }

  return (
    <div className="flex justify-center items-center">
      <motion.div
        className={`${sizeClasses[size]} border-t-4 border-blue-500 border-solid rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
    </div>
  )
}

