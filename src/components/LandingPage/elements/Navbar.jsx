
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import logo from '../../../assets/logo_typo_w.svg'
import { useNavigate } from 'react-router-dom'

export function Navbar() {
    const navigate = useNavigate()
  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gray-900/10 border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <img src={logo} className='w-11 h-11'/>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 ml-30 text-[rgba(255,255,255,1)]">
            {['Features', 'Product', 'Pricing'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-300 hover:text-white transition-colors duration-200"
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4 ">
            <motion.a
              href=""
              className="text-gray-300 hover:text-white transition-colors duration-200"
              whileHover={{ y: -2 }}
              onClick={()=>{navigate('/login')}}
            >
              Login
            </motion.a>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={()=>{navigate('/login')}} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg shadow-blue-600/25" >
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}