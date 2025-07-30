import React from 'react';
import { cn } from "../lib/utils";
import logoLight from '../assets/logo_typo_w.svg';
import logoDark from '../assets/black_logo.svg';
import '../Loading.css'

function Loading({darkMode = false , message = 'Loading...'}) {
  return (
      
      <div className={cn(
      "flex flex-col items-center justify-center z-10 h-[550px]", // ...existing code...
       // add more margin at bottom
    )}>
      <svg viewBox="15 15 70 70" className='loading' style={{ width: 80, height: 80 }}>
        <circle r="30" cy="50" cx="50" className='loading-cercle'></circle>
      </svg>
      <h1 className={darkMode ? 'text-white font-normal text-lg mt-2.5' : 'font-normal text-gray-600 text-lg mt-2.5'}>{message}</h1>
    </div>
      
   
     );

}

export default Loading;