import React,{useState,useEffect} from 'react'
import axios from 'axios'
import TaskAdminBoard from './TaskAdminBoard'
import UseFetch from '../../hooks/UseFetch'
import {SquareKanban,PanelsTopLeft} from 'lucide-react'
import Loading from '../Loading' 


function TaskDashboard() {
      const [allProject,setAllProject]=useState([])
      const [slectedProjectId,setSelectedProjectId]=useState(null)
      const [switchProject,setSwitchProject]=useState(false)

    
      const userData = UseFetch()
      const [loading,setLoading]=useState(false)
       const getTeamColor = (name) => {
    const colors = ['bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 
                    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };
      const fetchAllProject = async ()=>{
        setLoading(true)
        try {
    
          const availableProject = await axios.post("http://localhost:3000/project/api/getProjects",{ownerId:userData.id},{ withCredentials: true})
          
        setAllProject(availableProject.data)

        if(availableProject.data.length > 0 && !slectedProjectId){

            setSelectedProjectId(availableProject.data[0]._id)
        }
          
        } catch (error) {
    
          console.log("can't fetch available project for this user due to this",error);
          if(error.response && error.response.data){
    
            console.log(error.response.data);
            
          }
          
          
        }finally{

          setLoading(false)
        }
    
    
    
    
    
      }
    
      useEffect(()=>{
        fetchAllProject()
      },[])

      const handlePoject = (projectId)=>{

        setSelectedProjectId(projectId)
        setSwitchProject(false)
      }
  return (
  <div className="relative min-h-screen pb-20 bg-gray-50">
    <style>
      {`
        .project-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 transparent;
        }
        .project-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .project-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 6px;
        }
        .project-scrollbar::-webkit-scrollbar-track {
          background: #e0e7ef;
          border-radius: 6px;
        }
      `}
    </style>
        {loading && <div className='min-h-screen'><Loading message='Setting your Kanban Board' /></div> }
    
    {allProject.length === 0 ? (
      <div className="flex flex-col items-center justify-center min-h-[550px]">
        <PanelsTopLeft className="w-20 h-20 mb-6 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-400 mb-2">No Project Found</h2>
        <p className="text-gray-400 text-base">You have no available projects. Please create a project to get started.</p>
      </div>
    ) : (
      <>
        {slectedProjectId && <TaskAdminBoard projectId={slectedProjectId} />}

        {/* Project Switch Button */}
        <div className="fixed bottom-6 left-3/5 -translate-x-1/2 z-50">
          <button
            onClick={() => setSwitchProject((prev) => !prev)}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ minWidth: 180 }}
          >
            <PanelsTopLeft className="w-6 h-6 text-white" />
            <span className="text-white font-semibold text-base">Switch Project</span>
          </button>
        </div>

        {/* Popup Project List */}
        {switchProject && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center ">
            <div className="bg-white/80 w-full max-w-2xl p-8 rounded-2xl shadow-2xl flex flex-col items-center">
              <div className="flex flex-col items-center mb-6">
                <PanelsTopLeft className='w-14 h-14 mb-2 text-blue-700'/>
                <h3 className="text-2xl font-bold text-blue-700 mb-1">Select a Project</h3>
                <p className="text-gray-500 text-sm">Choose a project to access its task board</p>
              </div>
              <div className="w-full mb-4 p-2">
                <div
                  className="project-scrollbar"
                  style={{
                    maxHeight: allProject.length > 6 ? '340px' : 'none',
                    overflowY: allProject.length > 6 ? 'auto' : 'visible',
                    scrollBehavior: 'smooth',
                    paddingRight: '16px',
                    boxSizing: 'content-box'
                  }}
                >
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full py-2 px-4"
                  >
                    {allProject.map((project) => (
                      <button
                        key={project._id}
                        onClick={() => handlePoject(project._id)}
                        className={`flex flex-col items-center px-6 py-4 rounded-xl border-2 transition-all duration-150 shadow-sm 
                          ${slectedProjectId === project._id
                            ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold scale-105 shadow-md'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50/50'}
                        `}
                        style={{ minWidth: 160 }}
                      >
                        <svg className="w-9 h-9 mb-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <rect x="4" y="6" width="4" height="12" rx="1.5" fill="#2563eb" opacity="0.18"/>
                          <rect x="10" y="6" width="4" height="8" rx="1.5" fill="#2563eb" opacity="0.35"/>
                          <rect x="16" y="6" width="4" height="5" rx="1.5" fill="#2563eb" opacity="0.6"/>
                        </svg>
                        <span className="text-base font-medium truncate">{project.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSwitchProject(false)}
                className="mt-2 text-sm text-gray-400 hover:text-blue-600 hover:underline transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </>
    )}
  </div>
)
}

export default TaskDashboard
