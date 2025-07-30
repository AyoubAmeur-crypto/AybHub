import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Plus,
  Shield,
  Users,
  Building,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  Clock,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

import '../App.css'
import UseFetch from '../hooks/UseFetch';
import axios from 'axios';
import AdminSetting from '../components/admin/AdminSetting';
import WorkerSetting from '../components/worker/WorkerSetting';
import Loading from '../components/Loading';

const Setting = () => {

  const userData = UseFetch()


  if(userData.role==='manager' && userData.EntrepriseId){

    return <AdminSetting/>
  }
  if(userData.role==='worker' && userData.EntrepriseId){

    return <WorkerSetting/>
  }else{

    return <Loading message='Loading Your Settings'/>
  }
}

export default Setting;