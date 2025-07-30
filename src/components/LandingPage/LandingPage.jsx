

import { BackgroundEffects } from './elements/BackgroundEffects'
import { Navbar } from './elements/Navbar'
import { HeroSection } from './elements/HeroSection'
import { ProductMockup } from './elements/ProductMockup'
import { FeaturesGrid } from './elements/FeaturesGrid'
import { TestimonialsSection } from './elements/TestimonialsSection'
import { PricingSection } from './elements/PricingSection'
import { CTASection } from './elements/CTASection'
import { Footer } from './elements/Footer'
import '../../App.css'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white dark ">
      <BackgroundEffects />
      
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <ProductMockup />
          <FeaturesGrid />
          <TestimonialsSection />
          <PricingSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  )
}