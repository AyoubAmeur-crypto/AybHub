import UseFetch from '../hooks/UseFetch';
import { useState, useEffect } from 'react';
import axios from "axios";
import { CircleX, Plus, User, MoreVertical, Trash2, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import Loading from '../components/Loading'
import '../App.css'
import TeamAdmin from '../components/admin/TeamAdmin';
import TeamWorker from '../components/worker/TeamWorker';

function Team() {
  const userData = UseFetch()


  if(userData.role === 'manager') return <TeamAdmin/>
  if(userData.role === 'worker') return <TeamWorker/>



}

export default Team