
import { motion } from 'framer-motion'

import { Star } from 'lucide-react'

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager at TechFlow",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      content: "AYB HUB transformed how our team collaborates. The real-time sync feature is a game-changer for our distributed team.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO at InnovateLabs",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      content: "The integration capabilities are outstanding. We've streamlined our entire workflow and increased productivity by 40%.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Team Lead at DesignCo",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      content: "Best project management tool we've used. The interface is intuitive and the features are exactly what we needed.",
      rating: 5,
    },
  ]

  const integrations = [
    { name: "Google", logo: "G" },
    { name: "Microsoft", logo: "M" },
    { name: "Slack", logo: "S" },
    { name: "Notion", logo: "N" },
    { name: "Figma", logo: "F" },
  ]

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Loved by{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Teams Worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of teams already using AYB HUB to achieve their goals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 blur-xl rounded-2xl transition-opacity duration-500" />
              
              {/* Card */}
              <div className="relative bg-gray-900/40 backdrop-blur-xl border border-white/10 group-hover:border-blue-500/30 rounded-2xl p-8 h-full transition-all duration-300">
                {/* Stars */}
                <div className="flex space-x-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/30">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Integration Logos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-400 mb-8">Integrates seamlessly with your favorite tools</p>
          <div className="flex justify-center items-center space-x-8 flex-wrap gap-4">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl flex items-center justify-center text-gray-300 font-bold text-xl hover:border-blue-500/30 hover:text-white transition-all duration-300"
              >
                {integration.logo}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}