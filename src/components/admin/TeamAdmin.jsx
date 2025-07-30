import UseFetch from '../../hooks/UseFetch'
import { useState, useEffect } from 'react';
import axios from "axios";
import { CircleX, Plus, User, Users2, MoreVertical, Trash2, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import Loading from '../Loading'
import '../../App.css'

function TeamAdmin() {
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

  const createTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/team/api/createTeam", {
        name: teamFormData.name,
        description: teamFormData.description,
        manager: selectedManager._id,
        members: selectedMembers.map(u => u._id),
      }, { withCredentials: true });
      
      // Reset form
      setTeamFormData({ name: "", description: "", manager: "", members: [] });
      setSelectedMembers([]);
      setSelectedManager(null);
      setCreateTeamModal(false);
      showSuccess('Team created successfully!');
      fetchTeams(); // Refresh teams list
    } catch (error) {
      console.log("Team creation error:", error);
      if(error.response && error.response.data){
        showError(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async () => {
    setLoading(true);
    try {
      let updateData = {};

      if(selectedTeam.name.trim() !== editedTitle.trim()){

        updateData.name = editedTitle.trim()


      }

      if(selectedTeam.description.trim() !== editedDescription.trim()){

        updateData.description = editedDescription.trim()


      }

        if(!selectedManager || !selectedManager._id){

           showError('Set A Manager Please')
           setLoading(false)
           return
        }

      if ((selectedTeam.manager?._id || '') !== (selectedManager?._id || '')) {
  updateData.manager = selectedManager._id;
}

      const oldIds = (selectedTeam.members || []).map(m => m._id).sort().join(",");
    const newIds = (selectedMembers || []).map(m => m._id).sort().join(",");

    if(!newIds){

      showError('Set Members Please')
           setLoading(false)
           return
    }
    if (oldIds !== newIds) {
      updateData.members = selectedMembers.map(m => m._id);
    }

    if(Object.keys(updateData).length===0){

      showError('No changes Detected.')
      setLoading(false)
      return
    }


      const updatedTeam = await axios.post(
        `http://localhost:3000/team/api/updateTeam/${selectedTeam._id}`, 
        {Data:updateData},
        { withCredentials: true }
      );
      
      showSuccess(updatedTeam.data.message);
      setShowTeamDetailModal(false);
      fetchTeams();
    } catch (error) {
      console.error('Update error:', error);
      showError(error?.response?.data?.message || "Failed to update team");
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:3000/team/api/deleteTeam/${teamId}`, {
        withCredentials: true
      });
      
      setAllTeams(prev => prev.filter(t => t._id !== teamId));
      setShowDeleteConfirmModal(false);
      setTeamToDelete(null);
      setShowTeamDetailModal(false);
      showSuccess('Team deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addMember = (user) => {
    if (!selectedMembers.find(member => member._id === user._id)) {
      const newMembers = [...selectedMembers, user];
      setSelectedMembers(newMembers);
    }
  };

  const removeMember = (userId) => {
    const newMembers = selectedMembers.filter(member => member._id !== userId);
    setSelectedMembers(newMembers);
  };

  const selectManager = (user) => {
    setSelectedManager(user);
  };

  const removeManager = () => {
    setSelectedManager(null);
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
          
          <div className="flex items-center space-x-4">
            <button 
              className="bg-blue-600 text-white py-2.75 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-150 flex items-center shadow-lg"
              onClick={() => {
                setCreateTeamModal(true); 
                setSelectedMembers([]);
                setSelectedManager(null);
                setTeamFormData({ name: "", description: "", manager: "", members: [] });
              }}
            >
              <Plus className="mr-2 w-5 h-5" />
              Create Team
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-12">
               <Users2 className="mx-auto w-28 h-28 text-gray-300 mb-4" />
    <p className="text-gray-500 text-xl mb-4 font-medium">No Teams found</p>
              <button 
                className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-150 flex items-center mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={() => setCreateTeamModal(true)}
              >
                <Plus className="mr-2 w-5 h-5" />
                Create Your First Team
              </button>
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
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTeamToDelete(team);
                          setShowDeleteConfirmModal(true);
                        }}
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
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
     {isEditingTitle ? (
  <div className="flex items-center gap-2">
    <input
      type="text"
      value={editedTitle}
      onChange={(e) => { setEditedTitle(e.target.value); setPreviewTitle(e.target.value); }}
      className="text-2xl font-semibold text-gray-900 border-b-2 border-blue-500 outline-none w-full"
      autoFocus
    />
    <button
      disabled={editedTitle.trim().length === 0}
      onClick={() => {
        setIsEditingTitle(false);
        setPreviewTitle(editedTitle);
      }}
      className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-md"
    >
      change
    </button>
    <button
      onClick={() => {
        setIsEditingTitle(false);
        setEditedTitle(selectedTeam?.name || '');
        setPreviewTitle(selectedTeam?.name || '');
      }}
      className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
    >
      cancel
    </button>
  </div>
) : (
  <h2 className="text-2xl font-semibold text-gray-900 hover:text-blue-700 cursor-pointer"
    onClick={() => setIsEditingTitle(true)}
  >
    {previewTitle}
  </h2>
)}
{isEditingDescription ? (
  <div className="mt-2">
    <textarea
      value={editedDescription}
      onChange={(e) => setEditedDescription(e.target.value)}
      rows={3}
      className="w-full text-sm text-gray-600 border border-gray-300 rounded-lg p-2 outline-none resize-none focus:ring-blue-500 focus:ring-2 focus:ring-blue-200"
      autoFocus
    />
    <div className="flex gap-2 mt-2">
      <button
        disabled={editedDescription.trim().length === 0}
        onClick={() => {
          setIsEditingDescription(false);
          setPreviewDescription(editedDescription);
        }}
        className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md"
      >
        change
      </button>
      <button
        onClick={() => {
          setIsEditingDescription(false);
          setEditedDescription(selectedTeam?.description || '');
          setPreviewDescription(selectedTeam?.description || '');
        }}
        className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
      >
        cancel
      </button>
    </div>
  </div>
) : (
  <div className="mt-2">
    <p className="text-sm text-gray-600 hover:text-blue-700 cursor-pointer min-h-[20px]"
      onClick={() => setIsEditingDescription(true)}
    >
      {previewDescription || "Click to add description..."}
    </p>
  </div>
)}
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
                          <p className="text-sm text-gray-500">Manage team members</p>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setShowManageMembersModal(true)}
             className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl transition-all duration-200 shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg">
                          <User className="w-4 h-4" />
                          <span>Manage Members</span>
                        </button>
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
                              <button
                                onClick={() => removeMember(member._id)}
                                className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                              >
                                <CircleX className="w-4 h-4" />
                              </button>
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
                          <p className="text-sm text-gray-500">Assign team leadership</p>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setShowManageManagerModal(true)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl transition-all duration-200 shadow-md hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg"
                        >
                          <User className="w-4 h-4" />
                          <span>{selectedManager ? 'Change' : 'Assign'}</span>
                        </button>
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
                onClick={() => {setShowTeamDetailModal(false) , setSelectedTeam(prev=>({...prev,members:selectedMembers,manager:selectManager}))}}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center transition-colors" 
                onClick={updateTeam}
                disabled={loading}
              >
                {loading ? (
  <span className="flex items-center gap-2">
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
    Saving...
  </span>
) : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {createTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0 bg-black/20 backdrop-blur-sm pop-up-animate">
          <div className="bg-white w-full max-w-5xl md:w-[900px] rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-500">Create New Team</p>
                <button className="text-gray-400 hover:text-blue-600 rounded-full p-1.5"
                  onClick={() => setCreateTeamModal(false)}
                >
                  <CircleX className="w-6 h-6" />
                </button>
              </div>
              
              {/* Team Name */}
              <div className="flex items-start space-x-4">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl bg-blue-600`}>
                  <Plus className="w-8 h-8" />
                </div>
                <div className="flex-grow">
                  <input
                    type="text"
                    value={teamFormData.name}
                    onChange={(e) => setTeamFormData({...teamFormData, name: e.target.value})}
                    className="text-2xl font-semibold text-gray-900 bg-transparent border-none outline-none w-full placeholder-gray-400"
                    placeholder="Team Name"
                  />
                  <textarea
                    value={teamFormData.description}
                    onChange={(e) => setTeamFormData({...teamFormData, description: e.target.value})}
                    rows={2}
                    className="mt-2 text-sm text-gray-600 bg-transparent border-none outline-none w-full resize-none placeholder-gray-400"
                    placeholder="Team description..."
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow overflow-y-auto project-scrollbar">
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Team Members Section */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200/80 shadow-sm">
                    <div className="bg-white/80 backdrop-blur-sm p-5 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">Team Members</h3>
                            <p className="text-sm text-gray-500">Manage team members</p>
                          </div>
                        </div>
                        <div className="relative">
                          <button
  onClick={() => setShowManageMembersModal(true)}
  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl transition-all duration-200 shadow-md hover:from-blue-700 hover:to-blue-800"
>
  <User className="w-4 h-4" />
  <span>Add Members</span>
</button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Selected Members Display */}
                    <div className="p-5">
                      {selectedMembers.length > 0 ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto project-scrollbar">
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
                                <button
                                  onClick={() => removeMember(member._id)}
                                  className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                                >
                                  <CircleX className="w-4 h-4" />
                                </button>
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

                  {/* Team Manager Section */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200/80 shadow-sm">
                    <div className="bg-white/80 backdrop-blur-sm p-5 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">Team Manager</h3>
                            <p className="text-sm text-gray-500">Assign team leadership</p>
                          </div>
                        </div>
                        <div className="relative">
                          <button
  onClick={() => setShowManageManagerModal(true)}
  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl transition-all duration-200 shadow-md hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg"
>
  <User className="w-4 h-4" />
  <span>{selectedManager ? 'Change' : 'Assign'}</span>
</button>
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
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <div className='bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center w-9 h-9 rounded-full mr-2'>
                  {userData.avatar ? <img src={userData.avatar} className='w-9 h-9 rounded-full' alt="User" /> : 
                    <div className='text-white font-normal'>{userData.firstName[0] + userData.lastName[0]}</div>}
                </div>
                <p className="text-sm text-gray-600">Created by <span className="font-medium">{userData.firstName + ' ' + userData.lastName}</span></p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCreateTeamModal(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createTeam}
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                         {loading ? (
  <span className="flex items-center gap-2">
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
    Creating...
  </span>
) : "Create Team"}
              
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Management Modals */}
      {showManageMembersModal && (
  <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Manage Members</h3>
        <button onClick={() => setShowManageMembersModal(false)}>
          <CircleX className="w-6 h-6 text-gray-400 hover:text-blue-700" />
        </button>
      </div>
      {/* Selected Members Display (same as create modal) */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Selected Members</p>
        <div className="space-y-3 max-h-56 overflow-y-auto project-scrollbar">
          {selectedMembers.length > 0 ? (
            selectedMembers.map((member) => (
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
                <button
                  onClick={() => removeMember(member._id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                >
                  <CircleX className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-1">No members added yet</p>
            </div>
          )}
        </div>
      </div>
      {/* Available Users List */}
      <div className="space-y-2 max-h-64 overflow-y-auto project-scrollbar">
        {allAvailableUsers
          .filter(user =>
            !selectedMembers.some(member => member._id === user._id) &&
            (!selectedManager || selectedManager._id !== user._id)
          )
          .map((user) => (
            <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              onClick={() => addMember(user)}
            >
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                  {user.avatar ? 
                    <img src={user.avatar} alt={user.firstName} className="w-8 h-8 rounded-full" /> : 
                    <div className="text-white font-medium text-xs">{user.firstName[0] + user.lastName[0]}</div>
                  }
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900">{user.firstName + ' ' + user.lastName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  </div>
)}

      {showManageManagerModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Manager</h3>
              <button onClick={() => setShowManageManagerModal(false)}>
                <CircleX className="w-6 h-6 text-gray-400 hover:text-blue-700" />
              </button>
            </div>
            {/* Selected Manager Display (same as create modal) */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Manager</p>
              {selectedManager ? (
                <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4 mb-2">
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
                  <button
                    onClick={() => removeManager()}
                    className="mt-3 w-full flex items-center justify-center p-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <CircleX className="w-4 h-4 mr-2" />
                    Remove Manager
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-1">No manager assigned</p>
                </div>
              )}
            </div>
            {/* Available Users List */}
            <div className="space-y-2 h-64 overflow-y-auto">
              {allAvailableUsers
                .filter(user =>
                  !selectedMembers.some(member => member._id === user._id) &&
                  (!selectedManager || selectedManager._id !== user._id)
                )
                .map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => {
                      selectManager(user);
                      setShowManageManagerModal(false);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                        {user.avatar ? 
                          <img src={user.avatar} alt={user.firstName} className="w-8 h-8 rounded-full" /> : 
                          <div className="text-white font-medium text-xs">{user.firstName[0] + user.lastName[0]}</div>
                        }
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">{user.firstName + ' ' + user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      {showDeleteConfirmModal && teamToDelete && (
        <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Team</h3>
              </div>
            </div>
            
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete <span className="font-semibold">"{teamToDelete.name}"</span>?
            </p>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowDeleteConfirmModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteTeam(teamToDelete._id)}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                     {loading ? (
  <span className="flex items-center gap-2">
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
    Deleting...
  </span>
) : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Modals */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Success!</h3>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{successMessage}</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm pop-up-animate">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Error</h3>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{errorMessage}</p>
            <button 
              onClick={() => setShowErrorModal(false)}
              className="w-full px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamAdmin