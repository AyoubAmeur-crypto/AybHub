'use client'

import { motion } from 'framer-motion'

import { RefreshCw, Upload, Calendar, Users, BarChart3, MessageCircle } from 'lucide-react'

export function FeaturesGrid() {
  const features = [
    {
      icon: RefreshCw,
      title: "Real-time Sync",
      description: "Instant updates across all devices and team members",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Upload,
      title: "Cloud File Upload",
      description: "Secure file storage and sharing with Cloudinary integration",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Calendar,
      title: "Calendar + Due Date Sync",
      description: "Smart scheduling with automatic deadline tracking",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Granular permissions and team member management",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: BarChart3,
      title: "Project + Kanban Board",
      description: "Visual project management with drag-and-drop functionality",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: MessageCircle,
      title: "Messaging (1v1 & Group)",
      description: "Built-in chat system for seamless team communication",
      color: "from-indigo-500 to-indigo-600",
    },
  ]

  return (
    <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Powerful features designed to streamline your workflow and boost team productivity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-5 group-hover:opacity-5 blur-4xl rounded-3xl transition-opacity duration-500`} />
              
              {/* Card */}
              <div className="relative bg-gray-900/40 backdrop-blur-xl border border-white/10 group-hover:border-blue-500/30 rounded-2xl p-8 h-full transition-all duration-300">
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-20 blur-sm`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}