
import { motion } from 'framer-motion'
import { Github, Linkedin, Twitter, Mail , X} from 'lucide-react'
import logo from '../../../assets/logo_typo_w.svg'

import { useNavigate } from 'react-router-dom'

export function Footer() {
  const navigate = useNavigate()
  const sectionIdMap = {
    Newsletter: "newsletter",
    Product: "product",
    Pricing: "pricing",
    Features: "features",
  };
  const footerLinks = {
    Product: ['Features', 'Integrations', 'Pricing', 'Changelog'],
    Company: ['About', 'Blog', 'Careers', 'Contact'],
    Resources: ['Documentation', 'Help Center', 'Community', 'Status'],
    Legal: ['Privacy', 'Terms', 'Security', 'Compliance'],
  }

  const socialLinks = [
     { icon: Github, href: 'https://github.com/AyoubAmeur-crypto', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/in/ayoub-ameur-772a70362', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://x.com/Ayoub__Ameur', label: 'Twitter' },
  { icon: Mail, href: 'mailto:ayoubyameury@gmail.com', label: 'Contact' },
  ]

  return (
    <footer className="relative bg-gray-900/40 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                
                <div className="w-14 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                                  <img src={logo} className='w-13 h-13'/>
                            </div>

              </div>
              <p className="text-gray-400 max-w-sm">
                The all-in-one platform for team productivity. 
                Manage projects, tasks, and teams with real-time collaboration.
              </p>
              
              {/* Social links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:border-blue-500/30 transition-all duration-300"
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links sections */}
           {Object.entries(footerLinks).map(([title, links], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-white">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => {
                  // Check if the link is one of the active sections
                  const sectionId = sectionIdMap[link] || sectionIdMap[title];
                  if (sectionId) {
                    return (
                      <li key={link}>
                        <motion.a
                          href={`#${sectionId.toLowerCase()}`}
                          whileHover={{ x: 4 }}
                          className="text-gray-400 hover:text-white transition-colors duration-200"
                        >
                          {link}
                        </motion.a>
                      </li>
                    );
                  }
                  // Else, fallback to navigate to /later
                  return (
                    <li key={link}>
                      <motion.button
                        type="button"
                        onClick={() => navigate('/later')}
                        whileHover={{ x: 4 }}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {link}
                      </motion.button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <p className="text-gray-400 text-sm">
            © 2025 AYB HUB. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>Made with ❤️ By Ayoub Ameur</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}