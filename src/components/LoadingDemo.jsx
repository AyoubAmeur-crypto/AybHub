import React, { useState, useEffect } from 'react';
import { cn } from "../lib/utils";
import logoLight from '../assets/black_logo.svg';
import logoDark from '../assets/white_logo.svg';


function LoadingDemo({darkMode = false , message = 'Loading...'}) {

  
  
  return (
    <div className={cn(
            "flex flex-col items-center justify-center z-10 min-h-screen",
            darkMode ? "bg-slate-900" : "bg-slate-100"
          )}>
<img src={darkMode ? logoDark : logoLight} className='w-26 mb-4' alt="" srcset="" />
<h1 className={darkMode ? 'text-white font-semibold text-xl mb-2.5' : 'font-semibold text-xl mb-2.5'}>{message}</h1>
<div class="flex flex-row gap-2 mt-1">
  <div class="w-4 h-4 rounded-full bg-blue-400 animate-bounce"></div>
  <div class="w-4 h-4 rounded-full bg-blue-400 animate-bounce [animation-delay:-.3s]"></div>
  <div class="w-4 h-4 rounded-full bg-blue-400 animate-bounce [animation-delay:-.5s]"></div>
</div>
</div>

  );
}

export default LoadingDemo;