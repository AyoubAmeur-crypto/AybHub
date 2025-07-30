
import UseFetch from '../hooks/UseFetch'
import React from 'react'
import Loading from '../components/Loading'
import TaskDashboard from '../components/admin/TaskDashboard'
import TaskWorkerDashboard from '../components/worker/TaskWorkerDashboard'

function TaskBoard() {

    const userData = UseFetch()
    if(!userData || !userData.role) return <Loading message='Setting your TaskBoard...'/>
    if(userData.role === 'manager') return <TaskDashboard/>
    if(userData.role === 'worker') return <TaskWorkerDashboard/>
  
}

export default TaskBoard
