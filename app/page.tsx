import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ProcessSection } from "@/components/process-section"
import { ActivitySection } from "@/components/activity-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { Footer } from "@/components/footer"
import Particles from "@/components/particles"

export default function Page() {
  return (
    <>
      <div className="fixed inset-0 z-10">
        <Particles
          className="w-full h-full"
          particleCount={300}
          particleSpread={40}
          speed={0.2}
          moveParticlesOnHover={true}
          particleColors={["#4338ca", "#3b82f6", "#60a5fa"]}
        />
      </div>
      <div className="relative z-20">
        <Navbar />
        <HeroSection />
        <ProcessSection />
        <ActivitySection />
        <FeaturesSection />
        <PricingSection />
        <Footer />
      </div>
    </>
  )
}
