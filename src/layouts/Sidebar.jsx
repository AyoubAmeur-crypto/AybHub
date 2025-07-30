import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  MessageCircle, 
  Presentation, 
  Star,
  PanelsTopLeft,
  Zap,
  Calendar,
  Target,
  TrendingUp,
  Rocket,
  ArrowRight,
  
  HandCoins,
  CreditCard,
  Bell ,
  Users
} from "lucide-react";

import blacktypo from '../assets/black_logo.svg'
import whitetypo from '../assets/logo_typo_w.svg'
import { NavLink , useLocation } from 'react-router-dom';

function Sidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [ctaPressed, setCtaPressed] = useState(false);


   const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(!isClicked);
  };


 


  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard , path:'dashboard' },
    { name: 'Projects', icon: Presentation , path:'projects' },
    { name: 'Tasks', icon:   PanelsTopLeft ,  path:'tasks'  },
    { name: 'Calendar', icon: Calendar ,  path:'calendar' },
    { name: 'Messages', icon: MessageCircle ,  path:'messages' },
    { name: 'Teams', icon: Users ,  path:'teams'  },
    { name: 'Settings', icon: Settings ,  path:'settings' },
    
  ];

  const handleCtaClick = () => {
    setCtaPressed(true);
    console.log('Premium upgrade clicked');
  };
    const location = useLocation();


    const currentPath = location.pathname.replace('/workspace/', '');


  return (

    
    <aside className={`h-[calc(100vh-12px)] w-62 bg-white/95 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col rounded-2xl mb-3 `}>

      
      <div className="flex-shrink-0 pt-3 pb-2 px-5">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 flex items-center justify-center rounded-xl shadow-md">
            <img src={whitetypo} className='h-14 p-2' alt="" />
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        <div className="space-y-1.5">
          {navigationItems.map((item) => {
        const isActive = currentPath === item.path;

         return   <NavLink to={item.path}
              key={item.name}
              onClick={() => setActiveItem(item.name)}
              className={`
                group relative w-full flex items-center px-3 py-2 text-left rounded-2xl transition-all duration-200 ease-out
                 ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }
              `}
            >
              {/* Active indicator line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-7 bg-blue-600 rounded-full"></div>
                )}
              
              {/* Icon container */}
              <div className={`
                flex items-center justify-center w-9 h-9 rounded-xl mr-3 transition-all duration-200
                ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }
              `}>
                <item.icon size={18} strokeWidth={1.5} />
              </div>
              
              {/* Text */}
              <span className={`
                font-medium text-sm
               ${isActive ? 'font-semibold' : ''}
              `}>
                {item.name}
              </span>
            </NavLink>
          })}
        </div>
      </nav>

      <section className="px-3">
      <div 
        className={`
          h-[120px] max-w-2xl mb-5 relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 transform
           ${isClicked 
        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 scale-[0.98] shadow-2xl shadow-indigo-500/25' 
        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-[1.02] shadow-2xl shadow-blue-600/25 hover:shadow-indigo-600/40'
      }
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0">
          <div className="absolute top-2 left-4 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{animationDelay: '0s'}} />
          <div className="absolute top-6 right-8 w-1.5 h-1.5 bg-white/30 rounded-full animate-ping" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-4 left-12 w-1 h-1 bg-white/50 rounded-full animate-ping" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-8 right-4 w-1 h-1 bg-white/35 rounded-full animate-ping" style={{animationDelay: '0.5s'}} />
        </div>

        {/* Floating shapes */}
        <div className="absolute top-2 right-2 w-8 h-8 border border-white/10 rounded-full animate-spin" style={{animationDuration: '15s'}} />
        <div className="absolute bottom-2 left-2 w-4 h-4 border border-white/15 rounded rotate-45 animate-pulse" />

        {/* Main content */}
        <div className="relative z-10 h-full flex items-center justify-between px-3">
          
          {/* Left side - Icon and text */}
          <div className="flex items-center gap-2 ">
            {/* Premium icon with glow */}
            <div className={`
              relative p-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 transition-all duration-300
              ${isHovered ? 'scale-110 rotate-6' : ''}
              ${isClicked ? 'bg-white/25 scale-105' : ''}
            `}>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              <Zap className={`w-6 h-6 text-white relative z-10 transition-all duration-300 ${isClicked ? 'animate-bounce' : ''}`} />
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-white/20 blur-md animate-pulse" />
            </div>

            {/* Text content */}
            <div className="space-y-1">
              <h3 className={`font-bold text-white transition-all duration-300 ${isClicked ? 'text-lg' : 'text-base'}`}>
                {isClicked ? 'Beast Mode Activated 💪' : 'Boost Productivity'}
              </h3>
              <p className="text-xs text-white/80 font-medium">
                {isClicked ? 'Get ready for success!' : 'Unlock your potential today'}
              </p>
            </div>
          </div>

          {/* Right side - CTA Button */}
          <div className="flex items-center space-x-5">
            {/* Premium badge */}
           

            {/* Arrow button */}
            <div className={`
              relative group p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-300
              ${isHovered ? 'bg-white/30 scale-110' : ''}
              ${isClicked ? 'bg-emerald-400/30 border-emerald-300/50' : ''}
            `}>
              <ArrowRight className={`
                w-4 h-4 text-white transition-all duration-300
                ${isHovered ? 'translate-x-0.5' : ''}
                ${isClicked ? 'rotate-90' : ''}
              `} />
              
              {/* Button glow */}
              <div className="absolute inset-0 rounded-full bg-white/10 blur-sm group-hover:bg-white/20 transition-all duration-300" />
            </div>
          </div>
        </div>

        {/* Animated shine effect */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 transition-all duration-1000
          ${isHovered ? 'translate-x-full' : '-translate-x-full'}
        `} />

        {/* Success state overlay */}
        {isClicked && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 animate-pulse" />
        )}
      </div>
    </section>

  

    </aside>
  );
}

export default Sidebar;