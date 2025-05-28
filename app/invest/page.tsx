import { PricingSection } from "@/components/pricing-section"
import { AuthenticatedLayout } from "@/components/authenticated-layout"

export default function InvestPage() {
  return (
    <AuthenticatedLayout>
      <main className="container mx-auto px-4 py-8">
        <PricingSection />
      </main>
    </AuthenticatedLayout>
  )
}
