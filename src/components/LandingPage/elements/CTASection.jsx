
import { motion } from 'framer-motion'

import { ArrowRight, Mail } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import blurLogo from '../landingAssets/blur-logo.png'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'

export function CTASection() {
  const navigate = useNavigate()
  const [email,setEmail]=useState(null)
  const [loading,setLoading]=useState(false)
  const [success,setSuccess]=useState(false)

  const addEmailToNewsLetter = async ()=>{
    setLoading(true)
    try {
      const res = await axios.post("http://localhost:3000/newsLetter/sendEmail",{email:email})

      if(res.data.success){

        console.log("server response",res.data);
        
      }
      setEmail('')
      setSuccess(true)
      
    } catch (error) {
      console.log("can't add this email to newsLetter due to this",error);
      if(error.response && error.response.data){

        console.log("server error response : ",error.response.data.message);
        
      }
      
    }finally{

      setLoading(false)
    }
  }
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 " id='newsletter'>
      {/* Background effects */}
     
      
      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className=""
        >
          {/* Headline */}

          <div className="flex flex-col items-center justify-center pb-8  h-70">
                     
                                   <img
                                               src={blurLogo}
                                               className="w-[200px] sm:w-[300px]"
                                               style={{ opacity: '90%', mixBlendMode: 'screen' }}
                                             />   

          </div>

          {/* Subtext */}
          <p className="text-lg  text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of teams already transforming their productivity. 
            No credit card required, cancel anytime.
          </p>

          {/* Email signup form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-4 p-2 mt-4 bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your work email"
                  onChange={(e)=>{setEmail(e.target.value)}}
                  className="pl-10 bg-transparent border-none text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                disabled={!email || email.trim() === '' || success}
                onClick={addEmailToNewsLetter} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2 group">
                    {loading ? (
    <div className='flex flex-col items-center justify-center px-6'>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  ) : success ? (
    'Email Saved'
  ) : (
    <>
      Get Updates
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
    </>
  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-8"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button onClick={()=>{navigate('/login')}} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg rounded-xl shadow-2xl shadow-blue-600/25 relative overflow-hidden group">
                <span className="relative z-10 flex items-center gap-3">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
                
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-blue-500 opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-300" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400 text-sm pt-8"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>Free forever plan available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}