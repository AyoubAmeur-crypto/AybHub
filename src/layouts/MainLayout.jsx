import React, { useRef, useEffect, useState } from 'react'
import { checkfetchedData } from "../context/Authcontext";
import axios from "axios";
import { Outlet, useNavigate } from "react-router-dom";
import { useContext } from 'react';
import Sidebar from "./Sidebar"
import TopBar from './TopBar';

function MainLayout({children}) {
  const {userData} = useContext(checkfetchedData)
  
  const navigate = useNavigate()
  const handleLogout = async (e) => {
    try {
      const logout = await axios.post("http://localhost:3000/dashboard/logout",{WithCredentials:true})
      if(logout){
        navigate('/login')
      }
    } catch (error) {
      
    }
  }

  return (
    <div className="flex h-screen bg-gray-50/80 overflow-hidden">
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #93c5fd;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #60a5fa;
        }
      `}</style>

      {/* Fixed Sidebar */}
      <div className="flex-shrink-0 pl-2 pt-2 pb-2">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full pr-2 pb-2">
        {/* Fixed TopBar with backdrop blur */}
        <div className="sticky top-0 z-10 pt-2 mb-2 pl-4 bg-transparent">
          <TopBar userData={userData}/>
        </div>

        {/* Main Content - Scrollable */}
        


<div className="flex-1 relative  h-full ">
          <div className="relative py-2 px-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainLayout