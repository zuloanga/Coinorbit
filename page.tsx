import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ProcessSection } from "@/components/process-section"
import { ActivitySection } from "@/components/activity-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { Footer } from "@/components/footer"

export default function Page() {
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

      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <ProcessSection />
        <ActivitySection />
        <FeaturesSection />
        <PricingSection />
        <Footer />
      </div>
    </div>
  )
}
