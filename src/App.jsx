import React, { Children } from 'react'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { Route,Routes,BrowserRouter,Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

import Authcontext from './context/Authcontext'
import ProtectedRoute from './hooks/ProtectedRoute'
import ForgotPassword from './pages/ForgotPassword'
import LoadingDemo from './components/LoadingDemo';
import MainLayout from './layouts/MainLayout'
import Chat from './pages/Chat'
import Crm from './pages/Crm'
import ProjectBoard from './pages/ProjectBoard'
import Calendar from './pages/Calendar'
import Billing from './pages/Billing'
import Tellusmore from './pages/Tellusmore'
import InviteMembers from './components/admin/inviteMembers'
import AcceptInvitation from './components/worker/AcceptInvitation'
import { LocalizationProvider } from '@mui/x-date-pickers';
import TaskBoard from './pages/TaskBoard'
import Setting from './pages/Setting';
import Team from './pages/Team';
import LandingPage from './components/LandingPage/LandingPage';
import NotFound from './pages/NotFound';
import Later from './pages/Later'


// implement protected routes 

function App() {
  return (

   <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Authcontext>
      <BrowserRouter>
         <Routes>
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/forgotPassword' element={<ForgotPassword/>}/>
           {/*Identifying the role*/  }

           <Route path='/tellusmore' element={<ProtectedRoute><Tellusmore/></ProtectedRoute>}/>
           <Route path='/inviteMembers' element={<ProtectedRoute><InviteMembers/></ProtectedRoute>}/>
           <Route path='/assignCode' element={<ProtectedRoute><AcceptInvitation/></ProtectedRoute>}/>



          {/*Protected routes*/  }
          
          <Route path='/workspace'  element={<ProtectedRoute>
              <MainLayout/>
             </ProtectedRoute>}>
            <Route index element={<Navigate to="/workspace/dashboard" replace />} />
            <Route path='dashboard' element={<Dashboard/>}/>
             <Route path='projects' element={<ProjectBoard/>}/>
              <Route path='tasks' element={<TaskBoard/>}/>
              <Route path='calendar' element={<Calendar/>}/>
              <Route path='messages' element={<Chat/>}/>
              <Route path='teams' element={<Team/>}/>
              <Route path='invoices' element={<Crm/>}/>
              <Route path='billing' element={<Billing/>}/>
              <Route element={<Setting/>} path='settings'/>

                
             
             </Route>


             <Route path='/*' element={<NotFound/>}/>
             <Route path='/later' element={<Later/>}/>

             {/* other pages */}

              
          
         </Routes>

      
      
      </BrowserRouter>
      </Authcontext></LocalizationProvider>
          

  )
}

export default App