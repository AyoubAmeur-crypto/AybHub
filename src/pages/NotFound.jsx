
import { motion } from 'framer-motion'

import { Button } from '../components/LandingPage/ui/Button'
import { Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import dashboard from '../components/LandingPage/landingAssets/dashboard.png'
import { BackgroundEffects } from '../components/LandingPage/elements/BackgroundEffects'
import blurLogo from '../components/LandingPage/landingAssets/blur-logo.png'


export default function NotFound() {
    const navigate = useNavigate()
  return (
        <div className="min-h-screen bg-gray-950 text-white dark ">
                    <BackgroundEffects/>

            <div className="relative pt-38 pb-20 px-4 sm:px-6 lg:px-8">

        
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >

           <div className="flex flex-col items-center justify-center pb-6  h-30">

            <img
  src={blurLogo}
  className="w-[160px] sm:w-[300px]"
  style={{ opacity: '90%', mixBlendMode: 'screen' }}
/>          
                    </div>
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
  404{' '}
  <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent font-bold">
    Not
  </span>{' '}
  Found.
</h1>

{/* Subtext */}
<motion.p
  className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
>
  Sorry, the page you’re looking for doesn’t exist or is still under construction. Please check the URL or return to the home page.
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
              <Button onClick={()=>{navigate('/')}} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-2xl shadow-blue-600/25 relative overflow-hidden group">
                <span className="relative z-10">Back To Home Page</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
</div>
    
  )
}