export const cardStyles = {
  wrapper: "bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/5 shadow-[0_0_15px_rgba(37,99,235,0.1)]",
  gradientBorder: "bg-gradient-to-r from-blue-500/50 to-indigo-500/50",
  hoverEffect: "transition-all duration-300 hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]",
}

export const buttonStyles = {
  primary: `px-6 py-2 text-white font-medium rounded-xl transition-all duration-300
    bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-md
    shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]
    hover:from-blue-500 hover:to-indigo-500 border border-blue-400/50`,
  secondary: `px-6 py-2 text-white font-medium rounded-xl transition-all duration-300
    bg-slate-800/50 backdrop-blur-md border border-white/5
    hover:bg-slate-800/80 hover:border-white/10`,
}

export const inputStyles = {
  base: `w-full p-3 bg-slate-800/50 rounded-xl border border-white/5 text-white 
    placeholder-white/30 focus:outline-none focus:border-blue-500/50
    focus:ring-2 focus:ring-blue-500/20`,
}
