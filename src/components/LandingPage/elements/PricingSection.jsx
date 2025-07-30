
import { motion } from 'framer-motion'

import { Check, Zap } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useNavigate } from 'react-router-dom'

export function PricingSection() {

  const navigate = useNavigate('/login')
  
  const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 5 team members",
      "3 projects",
      "Basic task management",
      "File storage (1GB)",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "Free",
    description: "Everything you need for growing teams",
    features: [
      "Unlimited team members",
      "Unlimited projects",
      "Advanced analytics",
      "File storage (100GB)",
      "Priority support",
      "Custom integrations",
      "Advanced permissions",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Free",
    description: "Tailored solutions for large organizations",
    features: [
      "Everything in Professional",
      "Single sign-on (SSO)",
      "Advanced security",
      "Dedicated support",
      "Custom branding",
      "API access",
      "SLA guarantee",
    ],
    popular: false,
  },
]

  return (
    <section id="pricing" className="relative py-10 px-4 sm:px-6 lg:px-8">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30 mb-4">
            <Zap className="w-4 h-4 mr-2" />
            Early Access Perks
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Simple,{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Transparent
            </span>{' '}
            Pricing
          </h2>
           <h3 className="text-4xl md:text-4xl font-bold text-white mb-6">
            Enjoy all, AYB{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              HUB 
            </span>{' '}
            features at no cost
          </h3>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                To help teams grow and collaborate, all plans are currently free. Sign up and unlock every feature—no payment required!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
              className={`relative group ${plan.popular ? 'md:-mt-4' : ''}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-blue-600 text-white border-blue-500 px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 blur-xl rounded-3xl transition-opacity duration-500 ${plan.popular ? 'opacity-30' : ''}`} />
              
              {/* Card */}
              <div
  className={`relative bg-gray-900/40 backdrop-blur-xl border rounded-3xl p-8 h-full flex flex-col transition-all duration-300 ${
    plan.popular 
      ? 'border-blue-500/50 bg-gray-900/60' 
      : 'border-white/10 group-hover:border-blue-500/30'
  }`}
>
  {/* Header */}
  <div className="text-center mb-8">
    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
    <p className="text-gray-400 mb-4">{plan.description}</p>
    <div className="flex items-baseline justify-center">
      <span className="text-4xl font-bold text-white">{plan.price}</span>
      {plan.priceNote && (
        <span className="text-gray-400 ml-2">{plan.priceNote}</span>
      )}
    </div>
  </div>

  {/* Features */}
  <ul className="space-y-4 mb-8 flex-1">
    {plan.features.map((feature, featureIndex) => (
      <li key={featureIndex} className="flex items-center text-gray-300">
        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
        {feature}
      </li>
    ))}
  </ul>

  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="mt-auto mb-[10px]"
  >
    <Button 
      onClick={()=>{navigate('/login')}}
      className={`w-full py-3 rounded-xl transition-all duration-300  ${
        plan.popular
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
          : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-blue-500/50'
      }`}
    >
      Get Started
    </Button>
  </motion.div>
</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}