import UseFetch from '../../hooks/UseFetch'
import { useState, useEffect } from 'react';
import axios from "axios";
import { CircleX, Plus, User, Users2,MoreVertical, Trash2, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import Loading from '../Loading'
import '../../App.css'

function TeamWorker() {
  const userData = UseFetch()
  const [createTeamModal, setCreateTeamModal] = useState(false)
  const [teams, setAllTeams] = useState([])
  const [allAvailableUsers, setAllAvailableUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Team states
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [showTeamDetailModal, setShowTeamDetailModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState(null)
  const [teamFormData, setTeamFormData] = useState({
    name: "",
    description: "",
    manager: "",
    members: [],
  })
  
  // Member management states
  const [selectedMembers, setSelectedMembers] = useState([])
  const [selectedManager, setSelectedManager] = useState(null)
  const [showManageMembersModal, setShowManageMembersModal] = useState(false)
  const [showManageManagerModal, setShowManageManagerModal] = useState(false)
  const [previewTitle, setPreviewTitle] = useState('');
const [previewDescription, setPreviewDescription] = useState('');
  // UI states
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')

  const [editedDescription, setEditedDescription] = useState('')

  // Helper functions
  const getTeamColor = (name) => {
    const colors = ['bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 
                    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getTeamInitials = (name) => {
    if (!name || typeof name !== 'string') return 'T';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return words[0]?.[0]?.toUpperCase() || 'T';
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 4000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
    setTimeout(() => setShowErrorModal(false), 6000);
  };

  // API functions
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/team/api/getTeams", { withCredentials: true });
      if (res.data && Array.isArray(res.data.teams)) {
        setAllTeams(res.data.teams);
      } else {
        setAllTeams([]);
      }
    } catch (error) {
      console.log("Can't fetch teams:", error);
      setError(error?.response?.data?.message || "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMembers = async () => {
    try {
      const res = await axios.post("http://localhost:3000/project/api/fetchedMemberfirstTime", 
        { ownerId: userData.id }, 
        { withCredentials: true }
      );
      setAllAvailableUsers(res.data.members);
    } catch (error) {
      console.log("Can't fetch members:", error);
    }
  };


  





 

 

  const selectManager = (user) => {
    setSelectedManager(user);
  };

  

  // Initial data loading
  useEffect(() => {
    if (userData && userData.id) {
      fetchAvailableMembers();
      fetchTeams();
    }
  }, [userData.id]);

  // Set initial data when team is selected
  useEffect(() => {
    if (selectedTeam) {
      setEditedTitle(selectedTeam.name || '');
      setEditedDescription(selectedTeam.description || '');
      setSelectedManager(selectedTeam.manager || null);
       setPreviewTitle(selectedTeam.name || '');
    setPreviewDescription(selectedTeam.description || '');
      setSelectedMembers(selectedTeam.members || []);
    }
  }, [selectedTeam]);

  return (
    <div style={{fontFamily: 'Inter, sans-serif'}} className="bg-gray-50/80 min-h-full overflow-y-auto">
      {/* Main Content */}
      {loading ? <Loading message='Setting Your Teams'/> : <div className="py-6 px-8 overflow-y-auto project-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-gray-800">My Teams</h2>
          
         
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users2 className="mx-auto w-28 h-28 text-gray-300 mb-4" />
    <p className="text-gray-500 text-xl mb-4 font-medium">No Teams found</p>
    
  </div>
          ) : (
            teams.map((team) => (
              <div 
                key={team._id}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between cursor-pointer"
                onClick={() => {
                  setSelectedTeam(team);
                  setShowTeamDetailModal(true);
                }}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold mr-4 ${getTeamColor(team.name)}`}>
                        <span className='text-white font-semibold text-lg'>{getTeamInitials(team.name)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{team.name}</h3>
                        <p className="text-sm text-gray-500 max-w-[180px] line-clamp-2">{team.description}</p>
                      </div>
                    </div>
                 
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex -space-x-2">
                    {team.members?.slice(0, 3).map((member, i) => (
                      <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex flex-col items-center justify-center">
                        {member && member.avatar 
                          ? <img src={member.avatar} className='rounded-full w-9 h-9' alt={member.firstName} />
                          : <div className='text-white font-normal text-sm'>
                              {member?.firstName?.[0] || ''}{member?.lastName?.[0] || ''}
                            </div>
                        }
                      </div>
                    ))}
                    {team.members?.length > 3 && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-500 ring-2 ring-white">
                        +{team.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>}

      {/* Team Detail Modal */}
      {showTeamDetailModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-5xl md:w-[900px] rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-500">Team Detail</p>
                <button className="text-gray-400 hover:text-blue-600 rounded-full p-1.5"
                  onClick={() => {setShowTeamDetailModal(false) , setSelectedTeam(prev=>({...prev,members:selectedMembers,manager:selectManager}))}}
                >
                  <CircleX className="w-6 h-6" />
                </button>
              </div>
              
              {/* Team Name and Info */}
              <div className="flex items-start space-x-4 mb-4">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl ${getTeamColor(previewTitle)} `}>
  <span className="text-white font-semibold text-lg">{getTeamInitials(previewTitle)}</span>
</div>
                
                <div className="flex-grow">
    
  <h2 className="text-2xl font-semibold text-gray-900  "
    
  >
    {previewTitle}
  </h2>


  <div className="mt-2">
    <p className="text-sm text-gray-600  min-h-[20px]"
      
    >
      {previewDescription || "Click to add description..."}
    </p>
  </div>

                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow overflow-y-auto">
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Members Section (same as create modal) */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200/80 shadow-sm">
                  <div className="bg-white/80 backdrop-blur-sm p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">Team Members</h3>
                          <p className="text-sm text-gray-500">Discover team members</p>
                        </div>
                      </div>
                      <div className="relative">
                 
                      </div>
                    </div>
                  </div>
                  {/* Selected Members Display */}
                  <div className="p-5">
                    {selectedMembers.length > 0 ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto project-scrollbar pb-6 px-2">
                          {selectedMembers.map((member) => (
                            <div key={member._id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                  {member.avatar ? (
                                    <img src={member.avatar} alt={member.firstName} className="w-8 h-8 rounded-full" />
                                  ) : (
                                    <div className='text-white font-medium text-xs'>{(member?.firstName?.[0] || '') + (member?.lastName?.[0] || '')}</div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{member.firstName + ' ' + member.lastName}</p>
                                  <p className="text-xs text-gray-500">{member.email}</p>
                                </div>
                              </div>
                
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500 mb-1">No members added yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Manager Section (same as create modal) */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200/80 shadow-sm">
                  <div className="bg-white/80 backdrop-blur-sm p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">Team Manager</h3>
                          <p className="text-sm text-gray-500">Team leadership</p>
                        </div>
                      </div>
                      <div className="relative">
                    
                      </div>
                    </div>
                  </div>
                  {/* Selected Manager Display */}
                  <div className="p-5">
                    {selectedManager ? (
                      <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                            {selectedManager.avatar ? 
                              <img src={selectedManager.avatar} className="w-12 h-12 rounded-full object-cover" alt={selectedManager.firstName} /> : 
                              <div className="text-white font-bold text-lg">
                                {selectedManager.firstName[0] + selectedManager.lastName[0]}
                              </div>
                            }
                          </div>
                          <div className="flex-grow">
                            <p className="text-sm font-medium text-gray-900">{selectedManager.firstName + ' ' + selectedManager.lastName}</p>
                            <p className="text-xs text-gray-600">{selectedManager.email}</p>
                            <div className="flex items-center mt-1">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                              <span className="text-xs text-emerald-600 font-medium">Team Manager</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500 mb-1">No manager assigned</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <button 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
                onClick={() => {setShowTeamDetailModal(false)  }}
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}

      
     

     
    </div>
  )
}

export default TeamWorker