
import AdminDahboard from '../components/admin/AdminDahboard';
import WorkerDshboard from '../components/worker/WorkerDshboard';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import Loading from '../components/Loading';
import UseFetch from '../hooks/UseFetch';

function Dashboard() {
  const navigate = useNavigate();
 
 

  const userData = UseFetch()

  if(!userData || !userData.role){

    return <Loading message='Setting your workspace...'/>
  }

  if(userData.role === 'manager'){

    return <AdminDahboard/>
  }
  if(userData.role === 'worker') {

    return <WorkerDshboard/>
  }
}

export default Dashboard