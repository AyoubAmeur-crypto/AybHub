import axios from 'axios'
import React, { Children, createContext, useEffect, useState } from 'react'

export const checkfetchedData = createContext(null)

function Authcontext({children}) {
    const [userData,setUserData]=useState(null)
    const [loading,setLoading]=useState(true)
   const fetchData = async ()=> {

            try {
                
                const user = await axios.get("http://localhost:3000/api/me",{withCredentials:true})
                setUserData(user.data)
                console.log("fetched user :",user.data);
                

                
            } catch (error) {

                setUserData(null)
                console.log("cant fetch again the new role due to this",error);
                
                
            }finally {

                setLoading(false)
            }}
    useEffect(()=>{fetchData()},[])

     const logout = async () => {
        try {
          const isLogedout = await axios.post("http://localhost:3000/dashboard/logout",{},{withCredentials:true})
          setUserData(null)
         
         
        } catch (error) {
    
          console.log("can't logout due to this",error);
          
          
        }
      }
    
    const isLogged = !!userData

  return (
    <checkfetchedData.Provider value={{loading,setLoading,userData,isLogged,logout,fetchData}}>
        {children}
    </checkfetchedData.Provider>
  )
}

export default Authcontext