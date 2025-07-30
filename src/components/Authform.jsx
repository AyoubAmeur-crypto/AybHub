import React, { useState } from "react";
import { Eye, EyeOff, Chrome, Facebook, Mail, Lock, User, ArrowRight, CheckCircle2, Sun, Moon , AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";
import { cn } from "../lib/utils";
import logoLight from '../assets/black_logo.svg';
import logoDark from '../assets/white_logo.svg';
import '../App.css'

// Import shadcn components
import { Button } from "./Button";
import { Input } from "./input";
import { Card, CardContent, CardFooter } from "./Card";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert,AlertDescription, AlertTitle } from "./Alert";
import whitetypo from '../assets/logo_typo_w.svg'
// Hero image for the left side
const HeroImage = "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [alert,setAlert]=useState(null)
  const [loading,setLoading]=useState(false)
  const navigate = useNavigate()


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {

      const url = isLogin ? 'http://localhost:3000/auth/login' : 'http://localhost:3000/auth/signup'
      const payload = isLogin ? {email:formData.email,password:formData.password} : {firstname:formData.firstName,lastname:formData.lastName,email:formData.email,password:formData.password}

      const authentitcate = await axios.post(url,payload,{withCredentials:true})
    

    console.log(`Would redirect to ${isLogin ? 'dashboard after login' : 'dashboard after signup'}`);

        window.location.href = authentitcate.data.redirectTo

      
    } catch (error) {

      if(error.response?.data && error.response?.data?.message){

        const errMsg = error.response.data.message
        setAlert(errMsg) 


      }
      
    }finally{
            setLoading(false)

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
            src={HeroImage} 
            alt="Dashboard visualization" 
            className="h-full w-full object-cover"
            style={{ objectPosition: 'center' }}
          />
          <div className={cn(
            "absolute inset-0 mix-blend-multiply",
            darkMode 
              ? "bg-gradient-to-r from-blue-900/90 to-indigo-900/90" 
              : "bg-gradient-to-r from-blue-900/90 to-indigo-900/90"
          )} />
        </div>
        
        {/* Content overlay - also absolutely positioned */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-12 overflow-auto">
          {/* Your existing left column content */}
        <div className="flex items-center space-x-3">
                  <img src={whitetypo} className='h-24 p-2' alt="" />
                </div>
          
          {/* Middle content */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">
              {isLogin ? "Welcome back to your workspace" : "Join thousands of teams today"}
            </h2>
            <p className="text-lg text-white/80">
              Streamline your workflow, collaborate with your team, and achieve more together.
            </p>
            
            <div className="space-y-4">
              {[
                "Complete project management solution",
                "Real-time collaboration tools",
                "Powerful analytics and reporting",
                "Enterprise-grade security"
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
          
          {/* Bottom content */}
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
              <div
                className={cn(
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
              {isLogin ? "Sign in to your account" : "Create your account"}
            </h2>
            <p className={cn(
              "mt-2 text-sm",
              darkMode ? "text-slate-400" : "text-slate-500"
            )}>
              {isLogin 
                ? "Enter your credentials to access your workspace" 
                : "Fill out the form below to get started"}
            </p>
            </div>

            {/* Auth form card */}
          <Card className={cn(
            "shadow-xl backdrop-blur-sm rounded-2xl border min-h-[450px] ",
            darkMode 
              ? "bg-gray-800/95 border-slate-700/50 shadow-2xl shadow-black/20" 
              : "bg-slate-100/80 border-slate-200"
          )}>
            <CardContent className="mb-3">
              {/* Alert with fixed height container */}
              <div className="">
                {alert && (
                 <div className="grid w-full max-w-xl items-start gap-4 mb-1">
     
  <Alert 
      variant="destructive"
      className={cn(
        // Theme colors only, structure unchanged
        darkMode 
          ? "bg-red-900/20 border border-red-800/40 text-red-200" 
          : "bg-red-50 border border-red-200/70 text-red-800"
      )}
    >
      <AlertCircleIcon className={cn(
        // Icon coloring
        darkMode ? "text-red-300" : "text-red-500"
      )}/>
      <AlertTitle className={cn(
        darkMode ? "text-red-300" : "text-red-700"
      )}>
        Authentication Error
      </AlertTitle>
      <AlertDescription className={cn(
        darkMode ? "text-red-200" : "text-red-600"
      )}>
        <p>{alert}</p>
      </AlertDescription>
    </Alert>
    </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={cn(
                        "text-sm font-medium",
                        darkMode ? "text-slate-300" : "text-slate-700"
                      )} htmlFor="firstName">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <Input
                          id="firstName"
                          type="text"
                          name="firstName"
                          
                          onChange={(e)=>{setFormData(prev=>({...prev,firstName:e.target.value}))}}
                          className={cn(
                            "pl-10 rounded-xl",
                            darkMode 
                              ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" 
                              : "bg-slate-200 border-slate-300 text-slate-900 placeholder-slate-500"
                          )}
                          placeholder="First Name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className={cn(
                        "text-sm font-medium",
                        darkMode ? "text-slate-300" : "text-slate-700"
                      )} htmlFor="lastName">
                        Last Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <Input
                          id="lastName"
                          type="text"
                          name="lastName"
                          onChange={(e)=>{setFormData(prev=>({...prev,lastName:e.target.value}))}}
                          className={cn(
                            "pl-10 rounded-xl",
                            darkMode 
                              ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" 
                              : "bg-slate-200 border-slate-300 text-slate-900 placeholder-slate-500"
                          )}
                          placeholder="Last Name"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
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
                      onChange={(e)=>{setFormData(prev=>({...prev,email:e.target.value}))}}
                      className={cn(
                        "pl-10 rounded-xl",
                        darkMode 
                          ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" 
                          : "bg-slate-200 border-slate-300 text-slate-900 placeholder-slate-500"
                      )}
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={cn(
                      "text-sm font-medium",
                      darkMode ? "text-slate-300" : "text-slate-700"
                    )} htmlFor="password">
                      Password
                    </label>
                    {isLogin && (
                      <NavLink to='/forgotPassword' className={cn(
                        "text-xs font-medium",
                        darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"
                      )}>
                        Forgot password?
                      </NavLink>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={(e)=>{setFormData(prev=>({...prev,password:e.target.value}))}}

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

               

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium rounded-xl shadow-lg"
                > {loading ? (<> <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg></>) : (<>{isLogin ? "Sign in" : "Create account"}
                  <ArrowRight className="ml-1 h-4 w-4" /></>)}
                  
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className={cn(
                      "w-full border-t",
                      darkMode ? "border-slate-700" : "border-slate-300"
                    )}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className={cn(
                      "px-4",
                      darkMode 
                        ? "bg-slate-800 text-slate-400" 
                        : "bg-slate-100 text-slate-500"
                    )}>
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                 <NavLink to='http://localhost:3000/auth/google'> <Button
                    variant="outline"
                    type="button"
                    className={cn('w-full',
                      darkMode 
                        ? "bg-slate-700 hover:bg-slate-600 border-slate-600 text-white" 
                        : "bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-700"
                    )}
                  >
                    <Chrome className="mr-2 h-4 w-4 text-red-500" />
                    Google
                  </Button></NavLink>
                 <NavLink to='http://localhost:3000/auth/facebook' >
                  <Button
                    variant="outline"
                    type="button"
                    

                    className={cn('w-full',
                      darkMode 
                        ? "bg-slate-700 hover:bg-slate-600 border-slate-600 text-white" 
                        : "bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-700"
                    )}
                  >
                    <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                    Facebook
                  </Button> </NavLink> 
                </div>
              </div>
            </CardContent>
            
            <CardFooter className={cn(
              "flex justify-center border-t p-6",
              darkMode ? "border-slate-700" : "border-slate-300"
            )}>
              <p className={darkMode ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {setIsLogin(!isLogin), setAlert(null)}}
                  className={cn(
                    "font-medium",
                    darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"
                  )}
                >
                  {isLogin ? "Sign up now" : "Sign in"}
                </button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}