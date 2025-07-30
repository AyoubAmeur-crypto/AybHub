import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Chrome, Facebook, Mail, Lock, User, ArrowRight, CheckCircle2, Sun, Moon , AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";
import { cn } from "../lib/utils";
import logoLight from '../assets/black_logo.svg';
import logoDark from '../assets/white_logo.svg';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../components/Inputotp"
import '../App.css'
import whitetypo from '../assets/logo_typo_w.svg'

// Import shadcn components
import { Button } from "../components/Button";
import { Input } from "../components/input";
import { Card, CardContent, CardFooter } from "../components/Card";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert,AlertDescription, AlertTitle } from "../components/Alert";
// Hero image for the left side
const HeroImage = "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80";

function ForgotPassword() {
      const [darkMode, setDarkMode] = useState(false);
      const [email, setemail] = useState('');
      const [successMessage,setSuccessMessage]=useState('')
      const [alert,setAlert]=useState(null)
      const [loading,setLoading]=useState(false)
      const [otp,setotp]=useState(false)
      const [code,setCode]=useState([])
      const [resetStep,setResetStep]=useState(0)
    const [showPassword, setShowPassword] = useState(false);
    const [showResetPassword,setshowResetPassword] = useState(false)
    const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
      
      const navigate = useNavigate()
    
    


const [timeLeft, setTimeLeft] = useState(50); // 5 minutes in seconds
const [canResend, setCanResend] = useState(false);



const handleResendOTP = async (e) => {

    e.preventDefault();
      setLoading(true);  // Set loading BEFORE API call
  setSuccessMessage(null);
  setCode([])  // Clear any previous messages
  setAlert(null);  
        
        try {
    
          const url = 'http://localhost:3000/auth/otp-code'
          
    
          const sendOtp = await axios.post(url,{email:email},{withCredentials:true})
        
        
          if(sendOtp){
    

            setSuccessMessage(`Otp has been Resent to ${email}`)
            setCanResend(false)
            setTimeLeft(50)
            setResetStep(1)
          }
    
          console.log("Authorised", email);

          
        } catch (error) {
             
          setSuccessMessage(null)
    
          if(error.response?.data && error.response?.data?.message){
    
            const errMsg = error.response.data.message
            setAlert(errMsg) 
    
    
          }
          
        }finally{
    
          setLoading(false)
        }

}

useEffect(()=>{


  if(!otp) return

  const timer = setInterval(()=>{

    setTimeLeft((prevTime)=>{


      if(prevTime <=1){


        setCanResend(true)
        clearInterval(timer)
        return 0

      }

      return prevTime -1;


    })




  },1000)
  
  return ()=>{clearInterval(timer)}

},[otp,canResend])

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage(null);
        setAlert(null);
        
        try {
          // Handle password reset (final step)
          if (resetStep === 2) {
            // Validate passwords
            if (!password || !confirmPassword) {
              setAlert("Please enter both password fields");
              setLoading(false);
              return;
            }
            
            if (password !== confirmPassword) {
              setAlert("Passwords don't match");
              setLoading(false);
              return;
            }
            
           
            const resetResponse = await axios.post(
              'http://localhost:3000/auth/reset-password',
              { email: email, password:password },
              { withCredentials: true }
            );
            console.log("data sent from server ",resetResponse.data);
            
            
            window.location.href = resetResponse.data.redirectTo

            
            if (resetResponse) {
              setSuccessMessage("Password reset successful! Redirecting to login...");
           
            }
            
            return;
          }
          
          // Handle email step (initial step)
          if (resetStep === 0) {
         
            
            const response = await axios.post(
              'http://localhost:3000/auth/otp-code',
              { email },
              { withCredentials: true }
            );
            
            if (response) {
             
              setResetStep(1); 
              setotp(true);
              setTimeLeft(300); 
              setCanResend(false);
            }
            
            return;
          }
          
          // Handle OTP verification (middle step)
          if (resetStep === 1) {
         
            
            // Get stored email
             
            
            const response = await axios.post(
              'http://localhost:3000/auth/verify-otp',
              { email: email, code:code },
              { withCredentials: true }
            );
            
            if (response) {
              setSuccessMessage("OTP verified successfully!");
              setResetStep(2); 
            }
          }
        } catch (error) {
          setSuccessMessage(null);
          
          if (resetStep === 1) {
            setCode([]); // Clear OTP input on error
          }
          
          if (error.response?.data && error.response?.data?.message) {
            setAlert(error.response.data.message);
          } else {
            setAlert("An error occurred. Please try again.");
          }
        } finally {
          setLoading(false);
        }
      };
    
      // Toggle dark mode
      const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
        document.documentElement.classList.toggle('dark');
      };
    
  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* LEFT COLUMN - COMPLETELY FIXED */}
      <div className="fixed left-0 top-0 bottom-0 hidden lg:block lg:w-1/2">
        {/* Background image - absolutely positioned */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1579389083078-4e7018379f7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
            alt="Security visualization" 
            className="h-full w-full object-cover"
            style={{ objectPosition: 'center' }}
          />
          <div className={cn(
            "absolute inset-0 mix-blend-multiply",
            darkMode 
              ? "bg-gradient-to-r from-blue-950/95 to-indigo-950/95" 
              : "bg-gradient-to-r from-blue-950/95 to-indigo-950/95"
          )} />
        </div>
        
        {/* Content overlay - also absolutely positioned */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-12 overflow-auto">
          {/* Top content with logo */}
          <div className="flex items-center">
            <img 
              src={whitetypo}
              alt="Ayb Hub"
              className="h-24 p-2"
            />
          </div>
          
          {/* Middle content more focused on security/password */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">
              Account Security Matters
            </h2>
            <p className="text-lg text-white/80">
              Resetting your password helps keep your account secure. Create a strong password to protect your valuable data.
            </p>
            
            <div className="space-y-4">
              {[
                "Strong passwords use a mix of characters",
                "Never reuse passwords across sites",
                "Reset passwords regularly for better security",
                "Two-factor authentication for extra protection"
              ].map((feature, i) => (
                <div key={i} className="flex items-center">
                  <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm text-white">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom testimonial content */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <img 
                    key={i}
                    src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${20 + i}.jpg`} 
                    alt={`User ${i}`}
                    className="h-8 w-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div className="text-sm text-white">
                Join <span className="font-bold">2,000+</span> teams already using Ayb Hub
              </div>
            </div>
            
            <div className="flex">
              {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-sm font-medium text-white">4.9/5 from over 3,000 reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - With margin to account for fixed left column */}
      <div className={cn(
        "min-h-screen w-full lg:ml-[50%] lg:w-1/2 flex items-center justify-center p-8 ",
        darkMode ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800" : "bg-slate-100"
      )}>
        {/* Auth modal - Card container */}
        <div className="w-full max-w-md ">
          {/* Header content */}
          <div className="text-center relative mb-6">
            {/* Dark mode toggle button */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={cn(
                "absolute right-0 top-0 p-2 rounded-full transition-colors",
                darkMode 
                  ? "bg-slate-800 text-yellow-400 hover:bg-slate-700" 
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              )}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* Mobile logo */}
            <div className="flex justify-center lg:hidden mb-6">
             <div className={cn(
                               "flex items-center justify-center rounded-xl shadow-md transition-colors duration-300",
                               darkMode
                                 ? "bg-blue-600"
                                 : "bg-blue-600"
                             )}
                           >
                             <img src={whitetypo} className="h-16 p-2" alt="" />
                           </div>
            </div>
            
            <h2 className={cn(
              "text-2xl font-bold tracking-tight",
              darkMode ? "text-white" : "text-slate-800"
            )}>
              Restore Your Password
            </h2>
            <p className={cn(
              "mt-2 text-sm",
              darkMode ? "text-slate-400" : "text-slate-500"
            )}>
                 Enter Your Email To Get Your Otp Code 
              
            </p>
          </div>
          
          {/* Auth form card */}
          <Card className={cn(
            "shadow-xl backdrop-blur-sm rounded-2xl border   ",
            darkMode 
              ? "bg-gray-800/95 border-slate-700/50 shadow-2xl shadow-black/20" 
              : "bg-slate-100/80 border-slate-200"
          )}>
            <CardContent className="pt-2 pb-0.5">
              {/* Alert with fixed height container */}
              <div className="">

                 {(successMessage || alert) && (
    <div className="grid w-full max-w-xl items-start gap-4 mb-3">
      <Alert 
        variant={successMessage ? "default" : "destructive"}
        className={cn(
          successMessage 
            ? (darkMode 
                ? "bg-green-900/20 border border-green-800/40 text-green-200" 
                : "bg-green-50 border border-green-200/70 text-green-800")
            : (darkMode 
                ? "bg-red-900/20 border border-red-800/40 text-red-200" 
                : "bg-red-50 border border-red-200/70 text-red-800")
        )}
      >
        {/* Change icon based on message type */}
        {successMessage 
          ? <CheckCircle2Icon className={cn(
              darkMode ? "text-green-300" : "text-green-500"
            )} />
          : <AlertCircleIcon className={cn(
              darkMode ? "text-red-300" : "text-red-500"
            )} />
        }
        
        {/* Change title based on message type */}
        <AlertTitle className={cn(
          successMessage
            ? (darkMode ? "text-green-300" : "text-green-700")
            : (darkMode ? "text-red-300" : "text-red-700")
        )}>
          {successMessage ? "Success" : "Otp Error"}
        </AlertTitle>
        
        <AlertDescription className={cn(
          successMessage
            ? (darkMode ? "text-green-200" : "text-green-600")
            : (darkMode ? "text-red-200" : "text-red-600")
        )}>
          <p>{successMessage || alert}</p>
        </AlertDescription>
      </Alert>
    </div>
  )}
                
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
               
                <div className="space-y-2">
  {/* Step 0: Email Input */}
  {resetStep === 0 && (
    <>
      <label className={cn(
        "text-sm font-medium",
        darkMode ? "text-slate-300" : "text-slate-700"
      )} htmlFor="email">
        Email Address
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Mail className="h-4 w-4 text-slate-400" />
        </div>
        <Input
          id="email"
          name="email"
          value={email}
          onChange={(e) => setemail(e.target.value)}
          className={cn(
            "pl-10 rounded-xl",
            darkMode
              ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              : "bg-slate-200 border-slate-300 text-slate-900 placeholder-slate-500"
          )}
          placeholder="name@example.com"
        />
      </div>
    </>
  )}

  {/* Step 1: OTP Input */}
  {resetStep === 1 && (
    <div className="flex flex-col items-center w-full">
      <InputOTP
        maxLength={6}
        className={cn(
          "gap-2",
          darkMode ? "otp-dark" : "otp-light"
        )}
        value={code}
        onChange={(value) => setCode(value)}
      >
        <InputOTPGroup className="gap-2">
          <InputOTPSlot
            index={0}
            className={cn(
              "w-10 h-12 text-center text-lg font-medium rounded-md transition-all",
              darkMode
                ? "bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                : "bg-white border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            )}
          />
          <InputOTPSlot
            index={1}
            className={cn(
              "w-10 h-12 text-center text-lg font-medium rounded-md transition-all",
              darkMode
                ? "bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                : "bg-white border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            )}
          />
          <InputOTPSlot
            index={2}
            className={cn(
              "w-10 h-12 text-center text-lg font-medium rounded-md transition-all",
              darkMode
                ? "bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                : "bg-white border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            )}
          />
        </InputOTPGroup>

        <InputOTPSeparator className={cn(
          "mx-1",
          darkMode ? "text-slate-500" : "text-slate-400"
        )}>-</InputOTPSeparator>

        <InputOTPGroup className="gap-2">
          <InputOTPSlot
            index={3}
            className={cn(
              "w-10 h-12 text-center text-lg font-medium rounded-md transition-all",
              darkMode
                ? "bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                : "bg-white border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            )}
          />
          <InputOTPSlot
            index={4}
            className={cn(
              "w-10 h-12 text-center text-lg font-medium rounded-md transition-all",
              darkMode
                ? "bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                : "bg-white border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            )}
          />
          <InputOTPSlot
            index={5}
            className={cn(
              "w-10 h-12 text-center text-lg font-medium rounded-md transition-all",
              darkMode
                ? "bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                : "bg-white border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            )}
          />
        </InputOTPGroup>
      </InputOTP>
      
      <p className={cn(
        "mt-3 text-sm",
        darkMode ? "text-slate-400" : "text-slate-500"
      )}>
        Enter the 6-digit code sent to {email}
      </p>
    </div>
  )}

  {/* Step 2: Password Reset */}
  {resetStep === 2 && (
    <div className="space-y-4">
      <div>
        <label className={cn(
          "text-sm font-medium",
          darkMode ? "text-slate-300" : "text-slate-700"
        )} htmlFor="password">
          New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "pl-10 pr-10 rounded-xl",
              darkMode 
                ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" 
                : "bg-slate-200 border-slate-300 text-slate-900 placeholder-slate-500"
            )}
            placeholder="••••••••"
          />
          <button
            type="button"
            className={cn(
              "absolute inset-y-0 right-0 flex items-center pr-3",
              darkMode ? "text-slate-400 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
            )}
            onClick={() => setShowPassword(prev => !prev)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <div>
        <label className={cn(
          "text-sm font-medium",
          darkMode ? "text-slate-300" : "text-slate-700"
        )} htmlFor="confirmPassword">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            id="confirmPassword"
            type={showResetPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={cn(
              "pl-10 pr-10 rounded-xl",
              darkMode 
                ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" 
                : "bg-slate-200 border-slate-300 text-slate-900 placeholder-slate-500"
            )}
            placeholder="••••••••"
          />
          <button
            type="button"
            className={cn(
              "absolute inset-y-0 right-0 flex items-center pr-3",
              darkMode ? "text-slate-400 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
            )}
            onClick={() => setshowResetPassword(prev => !prev)}
          >
            {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )}
</div>
               


                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium rounded-xl shadow-lg"
                > {loading ? (<> <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg></>) :  (
    <>
      {resetStep === 0 && 'Send OTP'}
      {resetStep === 1 && 'Verify OTP'}
      {resetStep === 2 && 'Reset Password'}
      <ArrowRight className="ml-1 h-4 w-4" />
    </>
  )}
                  
                </Button>
              </form>
  <div className="mt-4 flex flex-col items-center space-y-2">
    {resetStep === 1 && (
      <>
        <div className="flex items-center mt-2">
          {!canResend ? (
            <div className={cn(
              "flex items-center",
              darkMode ? "text-blue-300" : "text-blue-600"
            )}>
              <span className="inline-flex items-center justify-center mr-2">
                <svg 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </span>
              <span className="font-mono text-sm font-medium">
                Code expires in {formatTime(timeLeft)}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className={cn(
                "text-sm font-medium transition-colors",
                darkMode 
                  ? "text-blue-400 hover:text-blue-300" 
                  : "text-blue-600 hover:text-blue-700",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              Resend code
            </button>
          )}
        </div>
      </>
    )}
  </div>

             
              
            </CardContent>
             <CardFooter className={cn(
  "flex justify-center border-t ",
  darkMode ? "border-slate-700" : "border-slate-300"
)}>
  <p className={darkMode ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
    {resetStep === 0 
      ? "Back to Sign In?" 
      : (resetStep === 2 
          ? "Remember your password?" 
          : "Go back to previous step?")}{" "}
    <button 
      type="button" 
      onClick={() => {
        if (resetStep === 0 || resetStep === 2) {
          // From email input OR password reset, go directly to login
          navigate('/login');
        } else if (resetStep === 1) {
          // From OTP verification, go back to email input
          setResetStep(0);
          setotp(false);
          setCode([]);
          setAlert(null);
          setSuccessMessage(null);
        }
      }}
      className={cn(
        "font-medium",
        darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"
      )}
    >
      {resetStep === 0 || resetStep === 2 ? "Sign in" : "Go back"}
    </button>
  </p>
</CardFooter>
            
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword