import React, { useContext } from 'react'
import {checkfetchedData} from '../context/Authcontext'


export default function UseFetch() {

    const {userData} = useContext(checkfetchedData)


    return userData
  

}
