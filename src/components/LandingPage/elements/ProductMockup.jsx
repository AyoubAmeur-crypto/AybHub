
import { motion } from 'framer-motion'

import { Calendar, MessageSquare, BarChart3 } from 'lucide-react'

import calendar from '../landingAssets/calendar.png'
import dashboard from '../landingAssets/dash.png'
import team from '../landingAssets/team.png'


export function ProductMockup() {
  const mockups = [
    {
      icon: BarChart3,
      title: "Dashboard",
      description: "Real-time project insights",
      color: "from-blue-600 to-blue-700",
      delay: 0,
      pic:dashboard
    },
    {
      icon: Calendar,
      title: "Calendar",
      description: "Smart scheduling system",
      color: "from-green-500 to-green-600",
      delay: 0.2,
      pic:calendar
    },
    {
      icon: MessageSquare,
      title: "Team Chat",
      description: "Seamless communication",
      color: "from-purple-500 to-purple-600",
      delay: 0.4,
      pic:team
    },
  ]

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8" id='product'>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Experience the Power of{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Integration
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            See how our platform brings all your productivity tools together in perfect harmony.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockups.map((mockup, index) => (
            <motion.div
              key={mockup.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: mockup.delay }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="relative group"
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${mockup.color} opacity-0 group-hover:opacity-20 blur-xl rounded-3xl transition-opacity duration-500`} />
              
              {/* Card */}
              <div className="relative bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-83 overflow-hidden">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${mockup.color} rounded-xl flex items-center justify-center`}>
                    <mockup.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{mockup.title}</h3>
                    <p className="text-gray-400">{mockup.description}</p>
                  </div>
                </div>

                {/* Mock Interface */}
                     <img src={mockup.pic} width='100%' style={{opacity:'90%'}}/>

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-1 h-1 bg-gradient-to-r ${mockup.color} rounded-full opacity-60`}
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + i * 10}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}