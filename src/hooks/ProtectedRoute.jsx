import React, { useContext } from 'react'
import {checkfetchedData} from '../context/Authcontext'
import { Navigate, useNavigate } from 'react-router-dom'
import Laoding from '../components/Loading' 

function ProtectedRoute({children}) {
    const {loading,setLoading,userData,isLogged}= useContext(checkfetchedData)

    
    if(loading){

        return <Laoding message='Preparing your workspace...'/>
    }

    if(!isLogged){

        return <Navigate to='/login' replace/>
    }

    

    return children
}

export default ProtectedRoute