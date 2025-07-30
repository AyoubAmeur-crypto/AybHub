import React, { useState, useEffect } from 'react';
import logo from '../assets/white_logo.svg';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate()
  return (
    <div className='flex flex-col items-center justify-center min-h-screen w-full bg-black'> 
     <a href="/">
     <img src={logo} className='w-48' alt="" /></a>

     <div className="bg-black rounded-2xl flex flex-col items-center gap-1 p-4 mt-4">

      <h1 className='text-white text-2xl font-semibold'>HOME PAGE UI/ON GOING TO GO LOGIN/SIGNUP PAGE CLICK THE BUTON BELLOW</h1>
      <button  onClick={()=>{navigate('/login')}} className='bg-white text-black p-2 rounded-sm mt-1.5 cursor-pointer' >Login/Signup</button>
     </div>
    </div>
  );
}

export default Home;