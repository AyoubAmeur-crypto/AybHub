
import { motion } from 'framer-motion'

import { Button } from '../ui/Button'
import { Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import dashboard from '../landingAssets/dashboard.png'

export function HeroSection() {
    const navigate = useNavigate()
  return (
    <section className="relative pt-58 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Let's Build Something{' '}
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent font-bold">
              Brilliant
            </span>{' '}
            Together.
          </h1>

          {/* Subtext */}
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            AYB HUB is your all-in-one platform to manage projects, tasks, teams, and time. 
            Powered by real-time magic.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button onClick={()=>{navigate('/login')}} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-2xl shadow-blue-600/25 relative overflow-hidden group">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div
            className="hidden relative md:flex flex-col mt-26  items-center justify-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <img  src={dashboard} width='90%' style={{opacity:'80%'}}/>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}