import UseFetch from '../../hooks/UseFetch'
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, Pencil, MessageCircleOff,Trash2, Save, User, ArrowRight, CheckCircle2, CircleX, Search, Filter, SortAsc, Calendar, CheckSquare, Paperclip, MoreVertical, Plus, Settings, Bell, FileText, File, Image, FileSpreadsheet, Archive, AlertTriangle, Download, Clock, XCircle } from "lucide-react";
import { useEffect, useState ,useRef} from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormControl, InputLabel, Select, MenuItem , Button , Menu ,Checkbox,
  FormControlLabel,
  Typography,
  Chip,
  Radio,
  Divider } from '@mui/material';
import dayjs from 'dayjs';
import useDebounce from '../../hooks/useDebounce';
import Loading from '../Loading'

import '../../App.css'
import { getInitials } from '@fluentui/react';



function ProjectBoardAdmin() {
  const userData = UseFetch()
  const [projectModal, setProjectModal] = useState(false)
  const [allProjects, setAllProjects] = useState([]) // Changed from static to state
  const [allAvailableUsers, setAllAvailableUsers] = useState([]) // For member selection
  const [allAvailableTeams, setAllAvailableTeams] = useState([]) // For team selection
  const [darkMode, setDarkMode] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [commentloading,setCommentLoading] = useState(false)
  const [taskLoader,setTaskLoader]=useState(false)
  
  
  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  
  // Modal states


  const [showProjectActionsModal, setShowProjectActionsModal] = useState(false)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Modal states
  const [showManageMembersModal, setShowManageMembersModal] = useState(false)
  const [showManageTeamsModal, setShowManageTeamsModal] = useState(false)
  const [showManageManagerModal, setShowManageManagerModal] = useState(false)
  
  // Tab state
  const [activeTab, setActiveTab] = useState('tasks')


  //deleteProject
  const [showProjectMenu, setShowProjectMenu] = useState(null) 
const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
const [projectToDelete, setProjectToDelete] = useState(null)
  
  // Project form state
  const [project, setProjectData] = useState({
    name: "",
    description: "",
    manager: "",
    teams: [],
    members: [],
     attachments: [],
    dueDate: "",
    visibility: "",
    status: "",
    avatarUrl: "",
  })


  // different bg colors for projects profiles 
  function getTeamInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

  const getProjectGradient = (name) => {
  const gradients = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-red-500 to-red-600',
    'bg-gradient-to-br from-yellow-500 to-yellow-600',
    'bg-gradient-to-br from-pink-500 to-pink-600',
    'bg-gradient-to-br from-indigo-500 to-indigo-600',
    'bg-gradient-to-br from-teal-500 to-teal-600',
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
};

const getProjectInitials = (name) => {
  if (!name || typeof name !== 'string') return 'P';
  const words = name.trim().split(' ').filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0]?.[0]?.toUpperCase() || 'P';
};

const formatCommentDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Just posted
  if (diffInMinutes < 1) {
    return 'Just now';
  }
  
  // Minutes ago
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  // Hours ago (today)
  if (diffInHours < 24 && date.getDate() === now.getDate()) {
    return `${diffInHours}h ago`;
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate() && 
      date.getMonth() === yesterday.getMonth() && 
      date.getFullYear() === yesterday.getFullYear()) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })}`;
  }
  
  // This week
  if (diffInDays < 7) {
    return `${date.toLocaleDateString('en-US', { weekday: 'short' })} at ${date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })}`;
  }
  
  // Older dates
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const getTeamColor = (name) => {
  const colors = [
    'bg-purple-500',
    'bg-green-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

  // Selected items for project creation/editing
  const [uploadedAttachments, setUploadedAttachments] = useState([]) // For preview during creation
const [isUploading, setIsUploading] = useState(false)
// attachement front end function handler

const removeAttachment = (indexToRemove) => {
  setUploadedAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  setProjectData(prev => ({
    ...prev,
    attachments: prev.attachments.filter((_, index) => index !== indexToRemove)
  }));
};

// Add function to get file type icon
const getFileIconComponent = (type) => {
    if (type.includes('pdf')) return <FileText className="w-6 h-6 text-white" />;
  if (type.includes('doc')) return <FileText className="w-6 h-6 text-white" />;
  if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="w-6 h-6 text-white" />;
  if (type.includes('image')) return <Image className="w-6 h-6 text-white" />;
  if (type.includes('zip') || type.includes('rar')) return <Archive className="w-6 h-6 text-white" />;
  return <File className="w-6 h-6 text-white" />;
};

const getFileIconBackground = (type) => {
  if (type.includes('pdf')) return 'bg-gradient-to-br from-red-500 to-red-600';
  if (type.includes('doc')) return 'bg-gradient-to-br from-blue-500 to-blue-600';
  if (type.includes('sheet') || type.includes('excel')) return 'bg-gradient-to-br from-green-500 to-green-600';
  if (type.includes('image')) return 'bg-gradient-to-br from-purple-500 to-purple-600';
  if (type.includes('zip') || type.includes('rar')) return 'bg-gradient-to-br from-yellow-500 to-yellow-600';
  return 'bg-gradient-to-br from-gray-500 to-gray-600';
};

// Add function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
  const [selectedMembers, setSelectedMembers] = useState([])
  const [selectedTeams, setSelectedTeams] = useState([])
  const [selectedManager, setSelectedManager] = useState(null)

const deleteProject = async (projectId) => {
  setLoading(true);
  try {
    await axios.delete(`http://localhost:3000/project/api/deleteProject/${projectId}`, {
      withCredentials: true
    });
    
    setAllProjects(prev => prev.filter(p => p._id !== projectId));
    
    // Close modals
    setShowDeleteConfirmModal(false);
    setProjectToDelete(null);
    setShowProjectModal(false);
    
    showSuccess('Project deleted successfully!');
  } catch (error) {
    console.error('Delete error:', error);
    showError('Failed to delete project. Please try again.');
  } finally {
    setLoading(false);
  }
};
  
  // Project details data (will be fetched from API)
  const [projectTasks, setProjectTasks] = useState([])
  const [projectAttachments, setProjectAttachments] = useState([])
  const [projectComments, setProjectComments] = useState([])
  const [content,setContent]=useState(null)
  const [taskChanged,setTaskChanged]=useState(false)

  const postComment = async (project)=>{

    setContent(null)
    setCommentLoading(true)

    try {

      const addComment = await axios.post(`http://localhost:3000/project/api/createComment/${project._id}`,{content:content,userId:userData.id},{ withCredentials:true })

      if(addComment){

        console.log("comment added successfully");
        setContent(null)
        
      }
      
    } catch (error) {

      if(error.response && error.response.data){

        showError(error.response.data.message)
      }
      else{

                showError("Can't post a comment please try again")
                console.log("can't post comment due to this",error);
                

      }
      
    }finally{

      setCommentLoading(false)
    }
  }

  const getComment = async ()=>{

    try {

      const fetchedComment = await axios.get(`http://localhost:3000/project/api/comments/${selectedProject._id}`,{withCredentials:true})
    if(fetchedComment){

      console.log("fetched comments ",fetchedComment.data);
      setProjectComments(fetchedComment.data.comments)

      
    }
      
    } catch (error) {

      console.log("can't fetch commetns due to this");
      
      
    }
  }

  useEffect( ()=>{

    if(projectComments || showProjectModal){

       getComment()
    }


  },[showProjectModal,projectComments])

  const handleTitleEdit = () => {
  setEditedTitle(selectedProject?.name || '')
  setIsEditingTitle(true)
    setProjectHasChanges(true)

}

const handleDescriptionEdit = () => {
  setEditedDescription(selectedProject?.description || '')
  setIsEditingDescription(true)
    setProjectHasChanges(true)

}
  const saveTitleEdit = async () => {
  
  if (!editedTitle.trim()) {
    // Optionally show an error message here
    return;
  }
  setIsEditingTitle(false)
  setProjectHasChanges(true)
    setSelectedProject(prev => ({ ...prev, name: editedTitle }));

      await handleUpdateTitleDes({ ...selectedProject, name: editedTitle });


}

const saveDescriptionEdit = async () => {
   if (!editedDescription.trim()) {
    return; }
  setIsEditingDescription(false)
  setProjectHasChanges(true)
    setSelectedProject(prev => ({ ...prev, description: editedDescription })); 
      await handleUpdateTitleDes({ ...selectedProject, description: editedDescription });

    
    // Update visible description

}

const cancelEdit = () => {
  setIsEditingTitle(false)
  setIsEditingDescription(false)
  setEditedTitle(selectedProject?.name || '');
  setEditedDescription(selectedProject?.description || '');
}

useEffect(() => {

  
  // Check what the filter is returning
  const filtered = allAvailableUsers.filter(user => !selectedMembers.find(member => member.id === user.id));
 
}, [selectedMembers, allAvailableUsers]);

useEffect(() => {
  if (showProjectModal || projectModal) {
    // Prevent body scroll when modals are open
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  } else {
    // Restore body scroll when modals are closed
    document.body.style.overflow = 'unset';
    document.documentElement.style.overflow = 'unset';
  }
  
  // Cleanup on unmount
  return () => {
    document.body.style.overflow = 'unset';
    document.documentElement.style.overflow = 'unset';
  };
}, [showProjectModal, projectModal]);

const fetchProject = async () => {
     try {
    const fetchedProject = await axios.post(
      `http://localhost:3000/project/api/getProjects`,
      { ownerId: userData.id },
      { withCredentials: true }
    );
    const projects = fetchedProject.data;

    // Fetch tasks for each project and merge them in
    const projectsWithTasks = await Promise.all(
      projects.map(async (proj) => {
        try {
          const res = await axios.post(
            "http://localhost:3000/project/api/taskFromProject",
            { projectId: proj._id, entrepriseId: proj.entrepriseId },
            { withCredentials: true }
          );
          return { ...proj, tasks: res.data.tasks || [] };
        } catch {
          return { ...proj, tasks: [] };
        }finally{

        }
      })
    );

    setAllProjects(projectsWithTasks);
  } catch (error) {
    console.log("can't fetch project due to this", error);
    setError('Failed to fetch projects');
  }
    }

const [InitialLoader,setInitialLoader]=useState(false)
useEffect(()=>{


const IninitialFetch = async ()=>{

  setInitialLoader(true)
  try {

    await fetchProject()
    
  } catch (error) {
    
  }finally{

    setInitialLoader(false)

  }
}
  if (userData && userData.id) {

IninitialFetch()
  }


},[userData.id])
  
  useEffect(() => {
    

  fetchProject()



    
    const fetchMember = async () => {
      try {
        const res = await axios.post("http://localhost:3000/project/api/fetchedMemberfirstTime", { ownerId: userData.id }, { withCredentials: true })
        setAllAvailableUsers(res.data.members) // Use the state variable instead of setMembers
      } catch (error) {
        console.log("can't fetch members due to this", error);
      }
    }
    
    const fetchTeam = async () => {
      try {
        const res = await axios.post("http://localhost:3000/project/api/fetchedteam", { ownerId: userData.id }, { withCredentials: true })
        setAllAvailableTeams(res.data) // Use the state variable instead of setTeams
      } catch (error) {
        console.log("can't fetch teams due to this", error);
      }
    }

    if (userData && userData.id) {
      setLoading(true)
      try {
        fetchMember()
        fetchProject()
        fetchTeam()
        
      } catch (error) {

        console.log("can't fetch data from backend due to this",error);
        
        
      }finally{

        setLoading(false)
      }
    }
  }, [userData.id,project])

  useEffect(() => {
     if (selectedProject) {
        setEditedTitle(selectedProject.name || '')
        setEditedDescription(selectedProject.description || '')
        setSelectedManager(selectedProject.manager || null)
        setSelectedMembers(Array.isArray(selectedProject.members) ? selectedProject.members : [])
        setSelectedTeams(Array.isArray(selectedProject.teams) ? selectedProject.teams : [])
        
        // 🎯 Initialize originalStatus for change tracking
        if (!selectedProject.originalStatus) {
            setSelectedProject(prev => ({
                ...prev,
                originalStatus: prev.status
            }));
        }
    }
}, [selectedProject])

const handleUpdateTitleDes = async (project)=>{


    setLoading(true)
      try {
        const updateData = {
            name: editedTitle,
            description: editedDescription,
            status: selectedProject.status,
            dueDate: selectedProject.dueDate,
            members: selectedMembers?.map(m => m._id) || [],
            teams: selectedTeams?.map(t => t._id) || [],
            manager: selectedManager?._id || null,
            attachments: selectedProject.attachments || [],
            
            // 🎯 ALWAYS send hasProjectChanges (true or false)
            hasProjectChanges: projectHasChanges
        };

        console.log('🔍 Sending to backend:', {
            hasProjectChanges: projectHasChanges,
            updateDataKeys: Object.keys(updateData)
        });
        
        const updatedProject = await axios.post(
            `http://localhost:3000/project/api/updateProject/${project._id}`, 
            updateData,
            { withCredentials: true }
        );

        
        setProjectHasChanges(false);
        
    } catch (error) {
        console.error('❌ Update error:', error);
        if(error?.response?.data?.message){
            showError(error.response.data.message);
        } else {
            showError("Failed to update project");
        }
    } finally {
        setLoading(false);
    }

}

const handleUpdate = async(project) => {
  setLoading(true);
    
      try {
        const updateData = {
            name: editedTitle,
            description: editedDescription,
            status: selectedProject.status,
            dueDate: selectedProject.dueDate,
            members: selectedMembers?.map(m => m._id) || [],
            teams: selectedTeams?.map(t => t._id) || [],
            manager: selectedManager?._id || null,
            attachments: selectedProject.attachments || [],
            
            // 🎯 ALWAYS send hasProjectChanges (true or false)
            hasProjectChanges: projectHasChanges
        };

        console.log('🔍 Sending to backend:', {
            hasProjectChanges: projectHasChanges,
            updateDataKeys: Object.keys(updateData)
        });
        
        const updatedProject = await axios.post(
            `http://localhost:3000/project/api/updateProject/${project._id}`, 
            updateData,
            { withCredentials: true }
        );

        console.log('✅ Project updated:', updatedProject.data);
        
        showSuccess(updatedProject.data.message);
        setShowProjectModal(false);
        setProjectHasChanges(false);
        
    } catch (error) {
        console.error('❌ Update error:', error);
        if(error?.response?.data?.message){
            showError(error.response.data.message);
        } else {
            showError("Failed to update project");
        }
    } finally {
        setLoading(false);
    }
};
  
  useEffect(() => {
  const handleClickOutside = (event) => {
    if (showProjectMenu && !event.target.closest('.project-menu-container')) {
      setShowProjectMenu(null);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showProjectMenu]);

  // Replace your handleAttachement function (around line 288) with this:
const handleDownload = async (attachment) => {
   try {
    console.log('Downloading attachment:', attachment);

    if (attachment.type.includes('image')) {
      // For images, just open the direct Cloudinary URL (should be image/upload now)
      console.log('Opening image URL:', attachment.url);
      window.open(attachment.url, '_blank');
    } else {
      // For PDFs, ZIPs, DOCs, etc., use the backend download route
      const downloadUrl = `http://localhost:3000/project/api/download/${attachment.cloudinaryId}/${encodeURIComponent(attachment.filename)}`;
      
      console.log('Non-image download URL:', downloadUrl);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download file. Please try again.');
  }
};
const handleAttachement = async (e) => {
  const files = Array.from(e.target.files); // 🔥 THIS LINE WAS MISSING!
  
  if (files.length === 0) return;
  
  if (uploadedAttachments.length + files.length > 10) {
    alert(`You can only upload up to 10 files. You currently have ${uploadedAttachments.length} files.`);
    return;
  }
  
  const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
  if (oversizedFiles.length > 0) {
    alert(`Some files exceed 5MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
    return;
  }
  
  setIsUploading(true);
  
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("attachements", file); // Keep as "attachements" to match your backend
    });
    
    console.log("Sending files to server:", files); // Debug log
    
    const res = await axios.post("http://localhost:3000/project/api/UpdloadAttachements", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true
    });
    
    
    setUploadedAttachments(prev => [...prev, ...res.data.attachments]);
    setProjectData(prev => ({
      ...prev, 
      attachments: [...(prev.attachments || []), ...res.data.attachments]
    }));
    
    e.target.value = '';
    
  } catch (error) {
    console.log("Can't fetch attachments from the cloud due to this:", error);
    
    if (error.response) {
      if (error.response.data && error.response.data.error) {
        showError(error.response.data.error);
      } else {
        showError(`Server error: ${error.response.status}`);
      }
    } else if (error.request) {
      console.log("No response received:", error.request);
      showError('No response from server. Check your connection.');
    } else {
      console.log("Error setting up request:", error.message);
      showError('Failed to upload attachments. Please try again.');
    }
  } finally {
    setIsUploading(false);
  }
};

const handleAttachmentUpdate = async (e) => {
  const files = Array.from(e.target.files);
  
  if (files.length === 0) return;
  
  const currentAttachments = selectedProject.attachments || [];
  
  if (currentAttachments.length + files.length > 10) {
    showError(`You can only upload up to 10 files. You currently have ${currentAttachments.length} files.`);
    return;
  }
  
  const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
  if (oversizedFiles.length > 0) {
    showError(`Some files exceed 5MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
    return;
  }
  
  setIsUploading(true);
  
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("attachements", file);
    });
    
    
    const res = await axios.post("http://localhost:3000/project/api/UpdloadAttachements", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true
    });
    
    // Update selectedProject state
    setSelectedProject(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...res.data.attachments]
    }));
    
    // Also update allProjects state
    setAllProjects(prev => 
      prev.map(project => 
        project._id === selectedProject._id 
          ? { ...project, attachments: [...(project.attachments || []), ...res.data.attachments] }
          : project
      )
    );
    
    e.target.value = '';
    
  } catch (error) {
    console.log("Can't upload attachments due to this:", error);
    
    if (error.response) {
      if (error.response.data && error.response.data.error) {
        showError(error.response.data.error);
      } else {
        showError(`Server error: ${error.response.status}`);
      }
    } else if (error.request) {
      console.log("No response received:", error.request);
      showError('No response from server. Check your connection.');
    } else {
      console.log("Error setting up request:", error.message);
      showError('Failed to upload attachments. Please try again.');
    }
  } finally {
    setIsUploading(false);
  }
};

const removeAttachmentUpdate = (indexToRemove) => {
  const updatedAttachments = selectedProject.attachments?.filter((_, index) => index !== indexToRemove) || [];
  
  // Update selectedProject state
  setSelectedProject(prev => ({
    ...prev,
    attachments: updatedAttachments
  }));
  
  // Also update allProjects state
  setAllProjects(prev => 
    prev.map(project => 
      project._id === selectedProject._id 
        ? { ...project, attachments: updatedAttachments }
        : project
    )
  );
  
};

  const handleAvatar = async (e) => {
  try {
    const file = e.target.files[0]
    if (!file) return;
    
    const formData = new FormData()
    formData.append("avatar", file)
    
    const res = await axios.post("http://localhost:3000/project/api/UploadAvatar", formData, {
      headers: {"Content-Type": "multipart/form-data"},
      withCredentials: true
    })
    
    const newAvatarUrl = res.data.url;
    
    // 🎯 Update project creation state
    setProjectData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
    
    // 🎯 If we're editing an existing project, also update selectedProject AND save to backend
    if (selectedProject) {
      setSelectedProject(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
      
      // 🚀 SAVE TO BACKEND IMMEDIATELY
      try {
        const updateResponse = await axios.post(
          `http://localhost:3000/project/api/updateProject/${selectedProject._id}`, 
          {
            avatarUrl: newAvatarUrl,
            hasProjectChanges: true // Force update even if no other changes
          },
          { withCredentials: true }
        );
        
        console.log('✅ Avatar saved to backend:', updateResponse.data);
        
        // Update the project in allProjects array with the saved data
        setAllProjects(prev => 
          prev.map(project => 
            project._id === selectedProject._id 
              ? { ...project, avatarUrl: newAvatarUrl }
              : project
          )
        );
        
        
      } catch (saveError) {
        console.error('❌ Failed to save avatar to backend:', saveError);
        showError('Failed to save avatar. Please try again.');
        
        // Revert the local changes if backend save failed
        setSelectedProject(prev => ({ ...prev, avatarUrl: prev.avatarUrl }));
      }
    }
    
    console.log('✅ Avatar updated:', newAvatarUrl);
    
  } catch (error) {
    console.log("❌ Can't fetch the image from the cloud due to this", error);
    showError("Failed to upload avatar. Please try again.");
  }
  }

  const createProject = async (e) => {
   
    e.preventDefault();
    setLoading(true)
    try {
      const addProject = await axios.post("http://localhost:3000/project/api/add", {
        name: project.name,
        description: project.description,
        manager: project.manager,
        teams: project.teams,
        members: project.members,
        attachments: project.attachments,
        dueDate: project.dueDate,
        visibility: project.visibility,
        avatarUrl: project.avatarUrl,
        status: project.status
      }, { withCredentials: true });
       setProjectData({
      name: "",
      description: "",
      manager: "",
      teams: [],
      members: [],
      attachments: [],
      dueDate: "",
      visibility: "",
      status: "",
      avatarUrl: "",
    });
    setSelectedMembers([]);
    setSelectedTeams([]);
    setSelectedManager(null);
    setUploadedAttachments([]);
    setProjectModal(false)
    showSuccess('Congratulations! Your project has been created successfully and is now visible on your project board.');

    } catch (error) {
      console.log("can't send res to the server due to this", error);
      if(error.response && error.response.data){
             
            showError(error.response.data.message);
          }
    }finally{

      setLoading(false)

        }
  }

const showSuccess = (message) => {
  setSuccessMessage(message);
  setShowSuccessModal(true);
  
  // Auto-hide after 4 seconds
  setTimeout(() => {
    setShowSuccessModal(false);
  }, 4000);
};

const showError = (message) => {
  setErrorMessage(message);
  setShowErrorModal(true);
  
  // Auto-hide after 6 seconds
  setTimeout(() => {
    setShowErrorModal(false);
  }, 6000);
};

  


  const handleProjectClick = async (project) => {

    try {
        const selectedProject = await axios.get(`http://localhost:3000/project/api/getProject/${project._id}`,{withCredentials:true})
        
        setSelectedProject(selectedProject.data)
        setShowProjectModal(true)

         const projectData = selectedProject.data;
    
    // 🎯 Store original values for change detection
    const enhancedProjectData = {
      ...projectData,
      originalStatus: projectData.status,
      originalDueDate: projectData.dueDate,
      originalMembers: [...(projectData.members || [])],
      originalTeams: [...(projectData.teams || [])],
      originalManager: projectData.manager ? {...projectData.manager} : null,
      originalAttachments: [...(projectData.attachments || [])]
    };
        
       
     setSelectedProject(enhancedProjectData);
    setShowProjectModal(true);
    
    // Initialize edit states
    setEditedTitle(projectData.name || '');
    setEditedDescription(projectData.description || '');
    setProjectHasChanges(false);
    setSelectedMembers(projectData.members || []);
    setSelectedTeams(projectData.teams || []);
    setSelectedManager(projectData.manager || null);

        console.log('Project data loaded:', selectedProject.data);
        
    } catch (error) {
        console.log("can't get the project due to this ",error);
    }finally{


    }
  }

  const handleCloseProjectModal = () => {
  if (hasUnsavedChanges()) {
    setShowCloseConfirmModal(true);
  } else {
    setShowProjectModal(false);
    // Reset states
    setSelectedProject(null);
    setEditedTitle('');
    setEditedDescription('');
    setProjectHasChanges(false);
  }
};

const discardChangesAndClose = () => {
  setShowCloseConfirmModal(false);
  setShowProjectModal(false);
  
  // Reset all states
  setSelectedProject(null);
  setEditedTitle('');
  setEditedDescription('');
  setProjectHasChanges(false);
  setSelectedMembers([]);
  setSelectedTeams([]);
  setSelectedManager(null);
};

// 🔧 ADD: Function to save changes and close modal
const saveChangesAndClose = async () => {
  try {
    setLoading(true);
    
    const updateData = {
      name: editedTitle,
      description: editedDescription,
      status: selectedProject.status,
      dueDate: selectedProject.dueDate,
      members: selectedMembers?.map(m => m._id) || [],
      teams: selectedTeams?.map(t => t._id) || [],
      manager: selectedManager?._id || null,
      attachments: selectedProject.attachments || [],
      hasProjectChanges: true
    };
    
    const updatedProject = await axios.post(
      `http://localhost:3000/project/api/updateProject/${selectedProject._id}`, 
      updateData,
      { withCredentials: true }
    );
    
    console.log('✅ Project saved before closing:', updatedProject.data);
    
    // Update allProjects state
    setAllProjects(prev => 
      prev.map(project => 
        project._id === selectedProject._id 
          ? { ...project, ...updateData }
          : project
      )
    );
    
    showSuccess('Project saved successfully!');
    setShowCloseConfirmModal(false);
    setShowProjectModal(false);
    
    // Reset states
    setSelectedProject(null);
    setEditedTitle('');
    setEditedDescription('');
    setProjectHasChanges(false);
    
  } catch (error) {
    console.error('❌ Save error:', error);
    showError(error?.response?.data?.message || "Failed to save project");
  } finally {
    setLoading(false);
  }
};


  const getStatusColor = (status) => {
    switch(status) {
      case 'Planning': return 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-sm'
      case 'In Progress': return 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold shadow-sm'
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-sm'
      case 'On Hold': return 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold shadow-sm'
      default: return 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-sm'
    }
  }

  const getProgressColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-500'
      case 'On Hold': return 'bg-red-500'
      default: return 'bg-blue-600'
    }
  }

 const addMemberToProject = (user) => {
    if (!selectedMembers.find(member => member._id === user._id)) {
    const newMembers = [...selectedMembers, user];
    setSelectedMembers(newMembers);
    setProjectData(prev => ({
      ...prev, 
      members: [...(prev.members || []), user._id]
    }));
  }
}

const removeMemberFromProject = (userId) => {
  
  const newMembers = selectedMembers.filter(member => member._id !== userId);
  setSelectedMembers(newMembers);
  setProjectData(prev => ({
    ...prev,
    members: prev.members.filter(memberId => memberId !== userId)
  }));
}

const addTeamToProject = (team) => {
  if (!selectedTeams.find(t => t._id === team._id)) {
    const newTeams = [...selectedTeams, team];
    setSelectedTeams(newTeams);
    setSelectedProject(prev => ({...prev, teams: newTeams}));
  }
}

const removeTeamFromProject = (teamId) => {
  const newTeams = selectedTeams.filter(team => team._id !== teamId);
  setSelectedTeams(newTeams);
  setSelectedProject(prev => ({...prev, teams: newTeams}));
}

const selectManagerForProject = (user) => {
  setSelectedManager(user);
  setSelectedProject(prev => ({...prev, manager: user}));
}

const removeManagerFromProject = () => {
   console.log('🔧 Removing manager from project');
    setSelectedManager(null);
    setSelectedProject(prev => ({...prev, manager: null}));
}
  const addMember = (user) => {
   
  
  if (!selectedMembers.find(member => member._id === user._id)) {
    const newMembers = [...selectedMembers, user];
    setSelectedMembers(newMembers);
    
    // Update project data with member IDs, ensuring no duplicates
    setProjectData(prev => {
      const currentMemberIds = prev.members || [];
      const memberAlreadyExists = currentMemberIds.includes(user._id);
      
      if (!memberAlreadyExists) {
        return {
          ...prev, 
          members: [...currentMemberIds, user._id]
        };
      }
      return prev; // No change if already exists
    });
  }
  }

  const removeMember = (userId) => {

       const newMembers = selectedMembers.filter(member => member._id !== userId);
  setSelectedMembers(newMembers);
  
  // Remove from project data
  setProjectData(prev => ({
    ...prev,
    members: (prev.members || []).filter(memberId => memberId !== userId)
  }));
  }

  const addTeam = (team) => {
    if (!selectedTeams.find(t => t._id === team._id)) {
    const newTeams = [...selectedTeams, team];
    setSelectedTeams(newTeams);
    
    // Update project data with team IDs, ensuring no duplicates
    setProjectData(prev => {
      const currentTeamIds = prev.teams || [];
      const teamAlreadyExists = currentTeamIds.includes(team._id);
      
      if (!teamAlreadyExists) {
        return {
          ...prev, 
          teams: [...currentTeamIds, team._id]
        };
      }
      return prev; // No change if already exists
    });
  }
  }

  const removeTeam = (teamId) => {
        
  const newTeams = selectedTeams.filter(team => team._id !== teamId);
  setSelectedTeams(newTeams);
  
  // Remove from project data
  setProjectData(prev => ({
    ...prev,
    teams: (prev.teams || []).filter(tId => tId !== teamId)
  }));
 
  }

  const selectManager = (user) => {
       console.log('Selecting manager:', user);
  setSelectedManager(user);
  setProjectData(prev => ({
    ...prev, 
    manager: user._id
  }));
  }

  const removeManager = () => {

    setSelectedManager(null);
  setProjectData(prev => ({
    ...prev, 
    manager: null // Set to null instead of empty string
  }));

  }

  // task api for project

  const [taskModal,setTaskModal]=useState(false)
  const [taskProjectData,setTaskProjectData]=useState({

    name:null,
    status:null
  })
  const [projectToAddTask,setProjectToAddTask]=useState(null)
  const [fetchedTasks,setFetchedTasks]=useState([])
  const [projectHasChanges, setProjectHasChanges] = useState(false);
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);


 

  const availableTask = async ()=>{
      
       try {
        const getAvailableTask = await axios.post("http://localhost:3000/project/api/taskFromProject", {
            projectId: selectedProject._id,
            entrepriseId: selectedProject.entrepriseId
        }, {withCredentials: true})
        
        console.log('🎯 Fetched tasks from API:', getAvailableTask.data);
        const tasksData = getAvailableTask.data.tasks || [];
        
        // 🎯 Update all task-related states
        setFetchedTasks(tasksData);
        
        setSelectedProject(prev => ({
            ...prev,
            tasks: tasksData
        }));
        
        setAllProjects(prev => 
            prev.map(project => 
                project._id === selectedProject._id 
                    ? { ...project, tasks: tasksData }
                    : project
            )
        );
        
    } catch (error) {
        console.log("can't fetch available tasks for this project", error);
        setFetchedTasks([]);
    }
    }

    const hasUnsavedChanges = () => {
      if (!selectedProject) return false;
  
  // Helper to safely compare values (handles null/undefined/empty string)
  const isDifferent = (current, original) => {
    // Treat null, undefined, and empty string as the same
    const normalizeValue = (val) => val || '';
    return normalizeValue(current) !== normalizeValue(original);
  };
  
  // Check each field for changes
  const titleChanged = isDifferent(editedTitle, selectedProject.name);
  const descriptionChanged = isDifferent(editedDescription, selectedProject.description);
  const statusChanged = isDifferent(selectedProject.status, selectedProject.originalStatus);
  const dueDateChanged = isDifferent(selectedProject.dueDate, selectedProject.originalDueDate);
  
  // Check arrays (members/teams)
  const currentMemberIds = selectedMembers?.map(m => m._id).sort().join(',') || '';
  const originalMemberIds = selectedProject.originalMembers?.map(m => m._id).sort().join(',') || '';
  const membersChanged = currentMemberIds !== originalMemberIds;
  
  const currentTeamIds = selectedTeams?.map(t => t._id).sort().join(',') || '';
  const originalTeamIds = selectedProject.originalTeams?.map(t => t._id).sort().join(',') || '';
  const teamsChanged = currentTeamIds !== originalTeamIds;
  
  // Check manager
  const currentManagerId = selectedManager?._id || '';
  const originalManagerId = selectedProject.originalManager?._id || '';
  const managerChanged = currentManagerId !== originalManagerId;
  
  // Check attachments
  const currentAttachmentIds = selectedProject.attachments?.map(a => a.cloudinaryId || a._id).sort().join(',') || '';
  const originalAttachmentIds = selectedProject.originalAttachments?.map(a => a.cloudinaryId || a._id).sort().join(',') || '';
  const attachmentsChanged = currentAttachmentIds !== originalAttachmentIds;
  
  return titleChanged || descriptionChanged || statusChanged || dueDateChanged || 
         membersChanged || teamsChanged || managerChanged || attachmentsChanged;
    }
  
  useEffect(()=>{

     if (showProjectModal && selectedProject?._id) {
        availableTask();
    }

  }, [showProjectModal,taskModal,selectedProject?._id]);


  const createTask = async (project)=>{
     setTaskProjectData({status: null, name: null})
    setTaskLoader(true)
   
    try {
        const createTaskResponse = await axios.post("http://localhost:3000/project/api/CreatetaskFromProject", {
            name: taskProjectData.name,
            status: taskProjectData.status,
            entrepriseId: project.entrepriseId,
            projectId: project._id,
            createdBy: userData.id
        }, {withCredentials: true})

        console.log('✅ Task created:', createTaskResponse.data);
                setProjectHasChanges(true);

        setTaskModal(false)
        
        setAllProjects(prevProjects => {
            // Check if prevProjects exists and is an array
            if (!prevProjects || !Array.isArray(prevProjects)) {
                console.warn('⚠️ allProjects is not an array:', prevProjects);
                return prevProjects || []; // Return empty array if undefined
            }
            
            return prevProjects.map(p => 
                p._id === project._id 
                    ? {
                        ...p, 
                        tasks: createTaskResponse.data.tasks || [...(p.tasks || []), createTaskResponse.data.task]
                      }
                    : p
            );
        });
        
        await handleProjectClick(project);
        await availableTask()

            
    } catch (error) {
        console.log("❌ Task creation error:", error);
        if(error?.response && error?.response?.data){
            showError(error.response.data.message)
        }
    } finally {
        setTaskLoader(false)
    }
  }

  // search logic and state

  const [searchValue,setSearachValue]=useState(null)
  const querySearch = useDebounce(searchValue,100)
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  
const [filterStatus, setFilterStatus] = useState([]);
const [filterVisibility, setFilterVisibility] = useState([]);
const [sortValue, setSortValue] = useState("");
const [filterValue, setFilterValue] = useState("");



  const filteredProjects = async ()=>{

    try {

      const filtredquerryProject = await axios.post(`http://localhost:3000/project/api/getfiltredProjects?search=${querySearch}`,{filters:{

        status:filterStatus,
        visibility:filterVisibility
      },sort:sortValue},{withCredentials:true})
      console.log(filtredquerryProject.data.projects);
      
      setAllProjects(filtredquerryProject.data.projects)
      
    } catch (error) {

      console.log("can't filter searh based on queery due to this",error);
      
      
    }
  }

  const handleSortClick = (event) => {
  setSortAnchorEl(event.currentTarget);
};

const handleSortClose = () => {
  setSortAnchorEl(null);
};
  const handleFilterClick = (event) => {
  setFilterAnchorEl(event.currentTarget);
};

const handleClose = () => {
  setFilterAnchorEl(null);
};

// Reusable handler for checkboxes
const toggleFilterValue = (value, type) => {
    const state = type === "status" ? filterStatus : filterVisibility;
  const setter = type === "status" ? setFilterStatus : setFilterVisibility;

  if (state.includes(value)) {
    setter(state.filter((v) => v !== value));
  } else {
    setter([...state, value]);
  }
};

  useEffect(()=>{
    if ( (querySearch && querySearch.trim() !== "") || filterStatus.length > 0 ||
    filterVisibility.length > 0 ||
    sortValue ) {
    filteredProjects();
  } else if (userData && userData.id) {
    fetchProject()
  }
  },[querySearch,userData,showProjectModal,filterStatus,filterVisibility,sortValue])

  

  return (
    <div style={{fontFamily: 'Inter, sans-serif'}} className="bg-gray-50/80 min-h-full overflow-y-auto">
      {/* CSS Styles */}
      <style jsx>{`
        .status-planning {
          background-color: #e0f2fe;
          color: #0ea5e9;
        }
        .status-progress {
          background-color: #fef9c3;
          color: #eab308;
        }
        .status-completed {
          background-color: #dcfce7;
          color: #22c55e;
        }
        .status-onhold {
          background-color: #fee2e2;
          color: #ef4444;
        }
        
        /* Modal scrollbars - thin soft blue */
        .modal-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb {
          background: #93c5fd;
          border-radius: 2px;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #60a5fa;
        }
          .status-planning {
          background-color: #dbeafe;
          color: #1d4ed8;
          border: 1px solid #3b82f6;
        }
        .status-progress {
          background-color: #e0f2fe;
          color: #0284c7;
          border: 1px solid #0ea5e9;
        }
        .status-completed {
          background-color: #dcfce7;
          color: #059669;
          border: 1px solid #10b981;
        }
        .status-onhold {
          background-color: #fef3c7;
          color: #d97706;
          border: 1px solid #f59e0b;
        }
        
        /* Modal scrollbars - thin soft blue */
        .modal-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb {
          background: #93c5fd;
          border-radius: 2px;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #60a5fa;
        }
          @keyframes modalPopIn {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.create-modal-animate,
.project-modal-animate {
  animation: modalPopIn 0.22s cubic-bezier(.4,2,.3,1) both;
}
         @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fade-in 0.18s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
                {InitialLoader && <div className='min-h-screen'><Loading message='Setting your Project Board' /></div> }

      {/* Main Content */}
      <div className="py-6 px-8 overflow-y-auto project-scrollbar" style={{maxHeight: 'calc(100vh - 120px)'}}>
        {/* Header with Search, Filters and Create Project Button - All in one line */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-gray-800">My Projects</h2>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-shadow duration-200" 
                placeholder="Search for project" 
                type="text"
                onChange={(e)=>setSearachValue(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-3 ">
      
      <div className="flex flex-col gap-2">
  <Button variant="outlined" onClick={handleSortClick}
  startIcon={<SortAsc className="w-5 h-5" style={{ color: '#fff' }} />}
  sx={{
    backgroundColor: '#2563eb', // blue-600
    color: '#fff',              // white text
    padding: '10px 16px',       // match input padding
    borderRadius: 2,            // match input border radius
    fontWeight: 600,
    boxShadow: '0 1px 4px 0 rgba(134, 138, 144, 0.08)',
   
  }}
  >
    Sort
  </Button>

  <Menu
    anchorEl={sortAnchorEl}
    open={Boolean(sortAnchorEl)}
    onClose={handleSortClose}
    PaperProps={{
      sx: { borderRadius: 3, padding: 1 },
    }}
  >
    <Typography sx={{ px: 2, py: 1 }} fontWeight={600}>
  Sort by
</Typography>

{[
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
  { label: "Oldest First", value: "createdAt-asc" },
  { label: "Newest First", value: "createdAt-desc" },
].map((option) => (
  <MenuItem key={option.value} onClick={() => setSortValue(option.value)}>
    <FormControlLabel
      control={<Radio checked={sortValue === option.value} />}
      label={option.label}
    />
  </MenuItem>
))}
  </Menu>
</div>
<div className="flex flex-col gap-1">
  <Button variant="outlined" onClick={handleFilterClick}
   startIcon={<Filter className="w-5 h-5" style={{ color: '#fff' }} />}
  sx={{
    backgroundColor: '#2563eb', // blue-600
    color: '#fff',              // white text
    padding: '10px 16px',       // match input padding
    borderRadius: 2,            // match input border radius
    fontWeight: 600,
    boxShadow: '0 1px 4px 0 rgba(59,130,246,0.08)',
   
  }}>
    Filter
  </Button>

  <Menu
    anchorEl={filterAnchorEl}
    open={Boolean(filterAnchorEl)}
    onClose={handleClose}
    PaperProps={{
      sx: { borderRadius: 3, padding: 1 },
    }}
  >
    <Typography sx={{ px: 2, py: 1 }} fontWeight={600}>
      Status
    </Typography>
    {["Planning", "In Progress", "Completed","On Hold"].map((status) => (

      <MenuItem key={status}>
        <FormControlLabel
          control={
            <Checkbox
              checked={filterStatus.includes(status)}
              onChange={() => toggleFilterValue(status, "status")}
            />
          }
          label={status}
        />
      </MenuItem>
    ))}

    <Divider sx={{ my: 1 }} />

    <Typography sx={{ px: 2, py: 1 }} fontWeight={600}>
      Visibility
    </Typography>
    {["public", "private"].map((visibility) => (
      <MenuItem key={visibility}>
        <FormControlLabel
          control={
            <Checkbox
              checked={filterVisibility.includes(visibility)}
              onChange={() => toggleFilterValue(visibility, "visibility")}
            />
          }
          label={visibility}
        />
      </MenuItem>
    ))}
  </Menu>

  {/* 🔎 Show Selected Filters as Chips */}
 
</div>
  </div>
            
            {/* Create Project Button */}
            <button 
              className="bg-blue-600 text-white py-2.75 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-150 flex items-center shadow-lg"
              onClick={() => {setProjectModal(true); setSelectedMembers([]);
    setSelectedTeams([]);
    setSelectedManager(null);
    setUploadedAttachments([]);
    setProjectData({
      name: "",
      description: "",
      manager: "",
      teams: [],
      members: [],
      attachments: [],
      dueDate: "",
      visibility: "",
      status: "",
      avatarUrl: "",
    });}}
            >
              <Plus className="mr-2 w-5 h-5" />
              Create Project
            </button>
          </div>
        </div>
           <style>
{`
  .project-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #3b82f6 transparent;
  }
  .project-scrollbar::-webkit-scrollbar {
    width: 2px;
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


        {/* Projects Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3" >

          {allProjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
    {/* Animated SVG */}
    <div className="mb-6 flex justify-center">
      <svg 
        width="200" 
        height="150" 
        viewBox="0 0 200 150" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-400"
      >
        {/* Background circles with floating animation */}
        <circle 
          cx="50" 
          cy="40" 
          r="3" 
          fill="currentColor" 
          opacity="0.3"
          className="animate-pulse"
          style={{
            animation: 'float 3s ease-in-out infinite',
            animationDelay: '0s'
          }}
        />
        <circle 
          cx="150" 
          cy="30" 
          r="2" 
          fill="currentColor" 
          opacity="0.4"
          className="animate-pulse"
          style={{
            animation: 'float 4s ease-in-out infinite',
            animationDelay: '1s'
          }}
        />
        <circle 
          cx="170" 
          cy="120" 
          r="2.5" 
          fill="currentColor" 
          opacity="0.3"
          className="animate-pulse"
          style={{
            animation: 'float 3.5s ease-in-out infinite',
            animationDelay: '2s'
          }}
        />
        
        {/* Main folder/project icon */}
        <g transform="translate(50, 40)">
          {/* Folder back */}
          <path 
            d="M20 25 L20 85 L80 85 L80 25 L50 25 L45 20 L20 20 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            opacity="0.6"
            className="animate-pulse"
            style={{
              animation: 'fadeInOut 2s ease-in-out infinite',
              animationDelay: '0s'
            }}
          />
          
          {/* Folder front */}
          <path 
            d="M10 35 L10 95 L90 95 L90 35 L60 35 L55 30 L10 30 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            opacity="0.8"
            style={{
              animation: 'slideIn 2.5s ease-in-out infinite',
              animationDelay: '0.5s'
            }}
          />
          
          {/* Plus icon in center */}
          <g transform="translate(45, 60)" opacity="0.5">
            <line 
              x1="0" 
              y1="-8" 
              x2="0" 
              y2="8" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{
                animation: 'scaleUpDown 2s ease-in-out infinite',
                animationDelay: '1s'
              }}
            />
            <line 
              x1="-8" 
              y1="0" 
              x2="8" 
              y2="0" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{
                animation: 'scaleUpDown 2s ease-in-out infinite',
                animationDelay: '1.2s'
              }}
            />
          </g>
        </g>
        
        {/* Floating document icons */}
        <g opacity="0.4">
          <rect 
            x="30" 
            y="20" 
            width="8" 
            height="10" 
            rx="1" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1"
            style={{
              animation: 'float 4s ease-in-out infinite',
              animationDelay: '0.5s'
            }}
          />
          <rect 
            x="160" 
            y="50" 
            width="8" 
            height="10" 
            rx="1" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1"
            style={{
              animation: 'float 3s ease-in-out infinite',
              animationDelay: '1.5s'
            }}
          />
        </g>
        
        {/* Animated dots */}
        <g opacity="0.3">
          <circle cx="100" cy="130" r="1.5" fill="currentColor">
            <animate 
              attributeName="opacity" 
              values="0.3;0.8;0.3" 
              dur="1.5s" 
              repeatCount="indefinite"
              begin="0s"
            />
          </circle>
          <circle cx="110" cy="130" r="1.5" fill="currentColor">
            <animate 
              attributeName="opacity" 
              values="0.3;0.8;0.3" 
              dur="1.5s" 
              repeatCount="indefinite"
              begin="0.5s"
            />
          </circle>
          <circle cx="120" cy="130" r="1.5" fill="currentColor">
            <animate 
              attributeName="opacity" 
              values="0.3;0.8;0.3" 
              dur="1.5s" 
              repeatCount="indefinite"
              begin="1s"
            />
          </circle>
        </g>
      </svg>
    </div>
    
    <p className="text-gray-500 text-lg mb-4 font-medium">No projects found</p>
    <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
      Create your first project to get started with organizing your work and collaborating with your team.
    </p>
    
    {/* Call to action button */}
    <button 
      className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-150 flex items-center mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
      onClick={() => {
        setSelectedMembers([]);
        setSelectedTeams([]);
        setSelectedManager(null);
        setUploadedAttachments([]);
        setProjectData({
          name: "",
          description: "",
          manager: "",
          teams: [],
          members: [],
          attachments: [],
          dueDate: "",
          visibility: "",
          status: "",
          avatarUrl: "",
        });
        setProjectModal(true);
      }}
    >
      <Plus className="mr-2 w-5 h-5" />
      Create Your First Project
    </button>
  </div>
          ) : (
            allProjects.map((proj) => {

             const doneStatusObj = (proj.taskStatuses || []).find(
    s => s.label.toLowerCase() === 'done'
  );
  const doneStatusId = doneStatusObj ? doneStatusObj.id : null;

  // Count tasks with that status
  const completedTasks = proj.tasks?.filter(task => task.status === doneStatusId).length || 0;
  const totalTasks = proj.tasks?.length || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (<div 
      key={proj._id}
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between cursor-pointer "
      onClick={() => handleProjectClick(proj)}
    >
      
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold mr-4 ${proj.avatarUrl ? '' : getProjectGradient(proj.name)}`}>
  {proj.avatarUrl ? (
    <img src={proj.avatarUrl} className='w-12 h-12 rounded-lg object-cover' alt={proj.name} />
  ) : (
    <span className='text-white font-semibold text-lg'>{getProjectInitials(proj.name)}</span>
  )}
</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{proj.name}</h3>
            </div>
          </div>
          <div className="relative project-menu-container">
            <button 
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setShowProjectMenu(showProjectMenu === proj._id ? null : proj._id);
              }}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {/* Dropdown Menu */}
            {showProjectMenu === proj._id && (
  <div className="absolute top-10 right-1 transform translate-x-3/5 -translate-y-1/4 w-24 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
    <div className="px-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setProjectToDelete(proj);
          setShowDeleteConfirmModal(true);
          setShowProjectMenu(null);
        }}
        className="w-full px-0.5 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center rounded-md group"
      >
        <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
        <span className="font-medium  text-sm">Delete ?</span>
      </button>
    </div>
  </div>
            )}
          </div>
          
        </div>
        <div className="text-sm text-gray-500 mb-1 flex items-center">
          <Calendar className="text-base mr-2 w-4 h-4" />
          {new Date(proj.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>
        <div className="text-sm text-gray-500 mb-2 flex items-center">
          <CheckSquare className="text-base mr-2 w-4 h-4" />
          {/* Fixed: Safe task counting */}
          {completedTasks}/{totalTasks} tasks
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            {/* Fixed: Safe progress calculation */}
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getProgressColor(proj.status)}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        <div className="mb-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(proj.status)}`}>
            {proj.status}
          </span>
        </div>
      </div>
     <div className="flex items-center justify-between mt-auto">
  <div className="flex -space-x-2">
    {proj.members?.slice(0, 3).map((member, i) => (
      <div key={i} className={`w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl ring-2 ring-white`}>
        {member.avatar ? <img src={member.avatar} className='w-9 h-9 rounded-full'/> : <div className='text-white font-normal text-sm'>{(member?.firstName?.[0] || '') + (member?.lastName?.[0] || '')}</div>}
      </div>
    ))}
    {proj.members?.length > 3 && (
      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-500 ring-2 ring-white">
        +{proj.members.length - 3}
      </div>
    )}
  </div>
  <div className="flex items-center text-sm text-gray-500">
    <Paperclip className="text-base mr-1 w-4 h-4" />
    {proj.attachments?.length || 0}
  </div>
</div>
    </div>)
            })
          )}
        </div>
      </div>

      {/* Project Detail Modal - Fixed Layout */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0 bg-black/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl md:w-[900px] rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col create-modal-animate animate-fade-in">
            {/* Custom scrollbar styles */}
            <style jsx>{`
               .custom-scrollbar {
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: #1e40af transparent;
        }
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #1e40af;
          border-radius: 3px;;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #1d4ed8;


              }
              
              .project-logo-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.2s ease;
                border-radius: 0.5rem;
              }
              
              .project-logo-container:hover .project-logo-overlay {
                opacity: 1;
              }
            `}</style>

            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-500">Project Detail</p>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-blue-600 hover:bg-gray-50/80 hover:backdrop-blur-sm rounded-full p-1.5 transition-all duration-300 hover:shadow-lg hover:scale-105" onClick={handleCloseProjectModal}>
  <CircleX className="w-6 h-6" />
</button>
                </div>
              </div>
              
              {/* Project Name and Logo Section */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="relative project-logo-container">
                  <div className={`w-16 h-16  rounded-lg flex items-center justify-center text-white font-bold text-2xl cursor-pointer ${!selectedProject.avatarUrl ? getProjectGradient(selectedProject.name) : ''}`}>
                    {selectedProject.avatarUrl ? (
      <img src={selectedProject.avatarUrl} alt="Project" className="w-16 h-16 rounded-lg object-cover" />
    ) : (
      <span className="text-white font-semibold text-lg">{getProjectInitials(selectedProject.name)}</span>
    )}
                  </div>
                  <div className="project-logo-overlay">
                    <input 
                      type="file" 
                      id="project-logo-upload" 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png,.gif"
                      onChange={(e) => handleAvatar(e)}
                    />
                    <label htmlFor="project-logo-upload" className="cursor-pointer text-white text-xs font-medium">
                      Edit Pic
                    </label>
                  </div>
                </div>
                
                <div className="flex-grow">
  {isEditingTitle ? (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        className="text-2xl font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 outline-none w-full"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') saveTitleEdit()
          if (e.key === 'Escape') cancelEdit()
        }}
      />
      <button 
        onClick={saveTitleEdit}
        className="px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
      >
        Save
      </button>
      <button 
        onClick={cancelEdit}
        className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
      >
        Cancel
      </button>
    </div>
  ) : (
    <h2 
      className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
      onClick={handleTitleEdit}
      title="Click to edit"
    >
      {selectedProject.name}
    </h2>
  )}
  
  {isEditingDescription ? (
    <div className="mt-2">
      <textarea
        value={editedDescription}
        onChange={(e) => setEditedDescription(e.target.value)}
        rows={3}
        className="w-full text-sm text-gray-600 bg-transparent border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        autoFocus
        placeholder="Project description..."
      />
      <div className="flex gap-2 mt-2">
        <button 
          onClick={saveDescriptionEdit}
          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Save
        </button>
        <button 
          onClick={cancelEdit}
          className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <div className="mt-2">
      <p 
        className="text-sm text-gray-600 cursor-pointer hover:text-blue-600 transition-colors min-h-[20px]"
        onClick={handleDescriptionEdit}
        title="Click to edit"
      >
        {selectedProject.description || "Click to add description..."}
      </p>
    </div>
  )}
  
                <div className="mt-5">
  <FormControl sx={{ minWidth: 180 }}>
    <InputLabel id="status-select-label">Status</InputLabel>
    <Select
      labelId="status-select-label"
      id="status-select"
      label="Status"
      value={selectedProject.status || ''}
      onChange={(e) => {
    const newStatus = e.target.value;
    setSelectedProject(prev => ({
      ...prev, 
      status: newStatus,
      // Store original status if not already stored
      originalStatus: prev.originalStatus || prev.status
    }));
  }}
      MenuProps={{
        PaperProps: {
          sx: {
            borderRadius: 3,
            boxShadow: 3,
          },
        },
      }}
    >
      <MenuItem value="Planning">Planning</MenuItem>
      <MenuItem value="In Progress">In Progress</MenuItem>
      <MenuItem value="Completed">Completed</MenuItem>
      <MenuItem value="On Hold">On Hold</MenuItem>
    </Select>
  </FormControl>
</div>
                </div>
              </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
              <div className="p-6 flex gap-6">
                {/* Left Column - Main Content (2/3 width) */}
                <div className="w-2/3 space-y-6">
                  {/* Project Info Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Assigned to</p>
                        <div className="flex -space-x-2">
                          {selectedProject.members?.slice(0, 3).map((member, i) => ( <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white">
        {member.avatar ? (
          <img src={member.avatar} alt={member.firstName} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="text-white font-normal text-xs">
            {member.firstName?.[0]}{member.lastName?.[0]}
          </div>
        )}
      </div>))}
                          {selectedProject.members?.length > 3 && (
                            <div className="h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                              +{selectedProject.members.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Assigned to Teams</p>
                        <div className="flex -space-x-2">
                           {selectedProject.teams?.slice(0, 3).map((team, i) => (
      <div key={i} className={`h-8 w-8 rounded-full ring-2 ring-white flex items-center justify-center text-xs font-medium text-white ${getTeamColor(team.name)}`}>
        
          <span className="text-white font-bold"> {getTeamInitials(team.name)}</span>
        
      </div>
    ))}
    {selectedProject.teams?.length > 3 && (
      <div className="h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
        +{selectedProject.teams.length - 3}
      </div>
    )}
                          
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-6">
                      <div>
                       <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker 
      label="Due Date" 
      name="DueDate"
   value={selectedProject.dueDate ? dayjs(selectedProject.dueDate) : null}
    onChange={(newValue) => {
      setSelectedProject(prev => ({
        ...prev, 
        dueDate: newValue ? newValue.toISOString() : null
      }));
    }}

       slotProps={{
  popper: {
    placement: 'bottom-start',
    container: () => document.querySelector('.bg-white.w-full.max-w-5xl'), // Target the modal container
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'clippingParents',
          padding: 8,
          altBoundary: true,
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
          boundary: 'clippingParents',
        },
      },
    ],
    sx: {
      zIndex: 9999,
      '& .MuiPaper-root': {
        maxHeight: '300px !important',
        overflow: 'hidden !important',
      },
    },
  },
  paperContent: {
    sx: {
      borderRadius: '16px',
      padding: 1,
      minHeight: 220,
      maxHeight: 280,
      overflow: 'hidden',
    },
  },
}}
    />
  </LocalizationProvider>
                      </div>
                      <div>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker 
      label="Created Date" 
      name="Created Date"
       readOnly 
        disableOpenPicker
                value={dayjs(selectedProject.createdAt)}
                slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 4],
                },
              },
            ],
          },
          paperContent: {
            sx: {
              borderRadius: '16px',     // rounded-2xl
              padding: 1,                // reduce default padding
              minHeight: 220,
              maxHeight: 320,            // reduce overall height
              overflow: 'hidden',
            },
          },
        }}
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': {
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: '#d1d5db',
              borderRadius: '0.5rem',
            },
            '&:hover fieldset': {
              borderColor: '#2563eb',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: '2px',
              boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            color: '#6b7280',
            '&.Mui-focused': {
              color: '#2563eb',
            },
          },
          '& .MuiInputBase-input': {
            padding: '8px 14px',
            height: 'auto',
          },
          '& .MuiIconButton-root': {
            color: '#6b7280',
            '&:hover': {
              color: '#2563eb',
            },
          },
        }}
    />
  </LocalizationProvider>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <div className="relative">
                        <button 
                          onClick={() => setShowManageMembersModal(true)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Manage Members</span>
                        </button>
                        
                       {showManageMembersModal && (
  <>
    <div 
      className="fixed inset-0 z-[9998] animate-fade-in" 
      onClick={() => setShowManageMembersModal(false)}
    ></div>
    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] max-h-72 overflow-hidden animate-fade-in">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Manage Members</h3>
          <button 
            onClick={() => setShowManageMembersModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CircleX className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-3">
          <div className="relative">
            <div className="border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600 transition-all">
              {selectedMembers.length > 0 && (
                <div className="p-2 border-b border-gray-100">
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto modal-scrollbar">
                    {selectedMembers.map((member) => (
                      <div key={member._id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-0.5 py-0.5 rounded-full text-xs flex-shrink-0">
                        <div className='bg-gradient-to-br from-blue-500 to-blue-600 w-6 h-6 rounded-full flex flex-col items-center justify-center'>{member.avatar ? <img className='w-6 h-6 rounded-full' src={member.avatar}/> : <div className='text-white font-normal'>{(member?.firstName?.[0] || '') + (member?.lastName?.[0] || '')}</div>}</div>
                        <span className="text-xs truncate max-w-16">{member.firstName.split(' ')[0]}</span>
                        <button 
                          onClick={() => removeMemberFromProject(member._id)}
                          className="hover:text-blue-900"
                        >
                          <CircleX className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-2">
                <input 
                  type="text"
                  placeholder={selectedMembers.length > 0 ? "Add more members..." : "Search and add members..."}
                  className="w-full outline-none text-xs placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-2">
          <h4 className="text-gray-500 uppercase text-xs mb-2 font-light tracking-wide">Available Members</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto modal-scrollbar pb-4">
            {allAvailableUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-xs">Loading available members...</p>
              </div>
            ) : (
              allAvailableUsers
                .filter(user => !selectedMembers.find(member => member._id === user._id))
                .map((user) => (
                <div 
                  key={user._id} 
                  className="flex items-center justify-between p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group"
                  onClick={() => addMemberToProject(user)}
                >
                  <div className="flex items-center space-x-2">
                    <div className='w-9 h-9 rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600'>{user.avatar ? <img className='w-9 h-9 rounded-full' src={user.avatar}/> : <div className='text-white font-normal'>{user?.firstName[0]+user?.lastName[0]}</div> } </div>                                           <div>
                      <p className="text-xs font-medium text-gray-900 truncate max-w-24">{user.firstName+' '+user.lastName}</p>
                      <p className="text-xs text-gray-500 truncate max-w-44">{user.email}</p>
                    </div>
                  </div>
                  <Plus className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  </>
)}
                      </div>

                      <div className="relative">
                        <button 
                          onClick={() => setShowManageTeamsModal(true)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Manage Teams</span>
                        </button>

                        {/* Compact Teams Modal */}
                       {showManageTeamsModal && (
  <>
    <div 
      className="fixed inset-0 z-[9998] animate-fade-in" 
      onClick={() => setShowManageTeamsModal(false)}
    ></div>
    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] max-h-72 overflow-hidden animate-fade-in">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Manage Teams</h3>
          <button 
            onClick={() => setShowManageTeamsModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CircleX className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-3">
          <div className="relative">
            <div className="border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600 transition-all">
              {selectedTeams.length > 0 && (
                <div className="p-2 border-b border-gray-100">
                  <div className="flex flex-wrap gap-1 h-8 overflow-y-auto modal-scrollbar">
                    {selectedTeams.map((team) => (
                      <div key={team._id} className="flex items-center gap-1  bg-blue-100 text-blue-800 px-0.5 py-0.5 rounded-full text-xs flex-shrink-0">
                        <div className={`w-7 h-7  rounded-full flex items-center justify-center text-white text-[11px] font-bold bg-blue-600`}>
                          {getTeamInitials(team.name)}
                        </div>
                        <span className="text-[12px] truncate max-w-16">{team.name.split(' ')[0]}</span>
                        <button 
                          onClick={() => removeTeamFromProject(team._id)}
                          className="hover:text-purple-900"
                        >
                          <CircleX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-2">
                <input 
                  type="text"
                  placeholder={selectedTeams.length > 0 ? "Add more teams..." : "Search and add teams..."}
                  className="w-full outline-none text-xs placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-2">
          <h4 className="text-gray-500 uppercase text-xs mb-2 font-light tracking-wide">Available Teams</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto modal-scrollbar mb-2 pb-4">
            {allAvailableTeams.length === 0 ? (
              <div className="text-center py-4 text-gray-500 ">
                <p className="text-xs">Loading available teams...</p>
              </div>
            ) : (
              allAvailableTeams
                .filter(team => !selectedTeams.find(t => t._id === team._id))
                .map((team) => (
                <div 
                  key={team._id} 
                  className="flex items-center justify-between p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group"
                  onClick={() => addTeamToProject(team)}
                >
                  <div className="flex items-center space-x-2">
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
      <span className="text-white font-normal text-md">
        {getTeamInitials(team.name)}
      </span>
    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-24">{team.name}</p>
                    </div>
                  </div>
                  <Plus className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  </>
)}
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200">
  <nav className="flex gap-4 -mb-px">
    <button 
      onClick={() => setActiveTab('tasks')}
      className={`py-3 px-1 text-sm font-medium border-b-2 ${activeTab === 'tasks' ? 'text-blue-600 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'}`}
    >
      Tasks
    </button>
    <button 
      onClick={() => setActiveTab('attachments')}
      className={`py-3 px-1 text-sm font-medium border-b-2 ${activeTab === 'attachments' ? 'text-blue-600 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'}`}
    >
      Attachments
    </button>
    <button 
      onClick={() => setActiveTab('comments')}
      className={`py-3 px-1 text-sm font-medium border-b-2 ${activeTab === 'comments' ? 'text-blue-600 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'}`}
    >
      Comments
    </button>
  </nav>
</div>

                  {/* Tab Content - Fixed margins for scrollbar */}
          <div     key={activeTab} className="transition-all duration-300 ease-in-out animate-fade-in">            
{activeTab === 'tasks' && (
  <div className="w-full space-y-4 animate-fade-tab">
    {/* Create Task Button - Always visible at top */}
    <div className="flex justify-start">
      <button 
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center" 
        onClick={() => { 
          setTaskModal(!taskModal); // Toggle instead of just setting to true
          if (!taskModal) {
            setProjectToAddTask(selectedProject);
          } else {
            setTaskProjectData({name: null, status: null});
            setProjectToAddTask(null);
          }
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        {taskModal ? 'Cancel' : 'Create Task'}
      </button>
    </div>

    {/* Task Creation Form - Embedded directly in component */}
    {taskModal && projectToAddTask && (
      <div className="bg-gray-50 rounded-lg p-4 animate-fade-in">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
          </div>
          
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Name
              </label>
              <input
                type="text"
                value={taskProjectData.name || ''}
                onChange={(e) => setTaskProjectData(prev => ({...prev, name: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm hover:border-blue-600 transition-colors"
                placeholder="Enter task name..."
              />
            </div>
            
            {/* Task Status Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Status
              </label>
              <FormControl fullWidth size="small">
                <Select
                  value={taskProjectData.status || ''}
                  onChange={(e) => setTaskProjectData(prev => ({...prev, status: e.target.value}))}
                  displayEmpty
                  sx={{
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#d1d5db',
                        borderRadius: '0.5rem',
                      },
                      '&:hover fieldset': {
                        borderColor: '#2563eb',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2563eb',
                        borderWidth: '2px',
                      },
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 2,
                        boxShadow: 3,
                        maxHeight: 200,
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <span className="text-gray-400">Select status...</span>
                  </MenuItem>
                 {(selectedProject?.taskStatuses || []).map((statusObj) => (
      <MenuItem key={statusObj.id} value={statusObj.id}>
        <div className="flex items-center">
          {statusObj.label}
        </div>
      </MenuItem>
    ))}
                </Select>
              </FormControl>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => {
                setTaskModal(false);
                setTaskProjectData({status: null, name: null});
                setProjectToAddTask(null);
              }}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => createTask(projectToAddTask)}
              disabled={loading || !taskProjectData.name || !taskProjectData.status}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
            >
              {taskLoader ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Task Content - Tasks List */}
    <div>
      {fetchedTasks.length ? (
        <div className='flex flex-col items-center gap-3 w-full'>
          {fetchedTasks.map((task) => {
            // Function to get status icon
             const getTaskStatusIconBackground = (status) => {
              switch(status) {
                case 'Todo':
                  return 'bg-gradient-to-br from-gray-500 to-gray-600';
                case 'Inprogress':
                  return 'bg-gradient-to-br from-yellow-500 to-yellow-600';
                case 'Done':
                  return 'bg-gradient-to-br from-green-500 to-green-600';
                case 'Blocked':
                  return 'bg-gradient-to-br from-red-500 to-red-600';
                default:
                  return 'bg-gradient-to-br from-blue-500 to-blue-600';
              }
            };
            const getTaskStatusIcon = (status) => {
               switch(status) {
                case 'Todo':
                  return <CheckSquare className="w-7 h-7 text-white" />;
                case 'Inprogress':
                  return <Clock className="w-7 h-7 text-white" />;
                case 'Done':
                  return <CheckCircle2 className="w-7 h-7 text-white" />;
                case 'Blocked':
                  return <XCircle className="w-7 h-7 text-white" />;
                default:
                  return <CheckSquare className="w-7 h-7 text-white" />;
              }
            };

            // Function to get status badge styling
            const getTaskStatusBadge = (status) => {
                switch(status) {
                case 'Todo':
                  return 'bg-blue-50 text-blue-700 border border-blue-200 font-medium';
                case 'Inprogress':
                  return 'bg-sky-50 text-sky-700 border border-sky-200 font-medium';
                case 'Done':
                  return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium';
                case 'Blocked':
                  return 'bg-amber-50 text-amber-700 border border-amber-200 font-medium';
                default:
                  return 'bg-blue-50 text-blue-700 border border-blue-200 font-medium';
              }
            };

            return (
             <div 
                key={task._id} 
                className="p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/30 transition-all duration-200 w-full group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-grow">
                    {/* Task Icon with Consistent Blue Gradient */}
                    <div className={`w-12 h-12 rounded-xl ${getTaskStatusIconBackground(task.status)} flex items-center justify-center shadow-sm`}>
                      {getTaskStatusIcon(task.status)}
                    </div>
                    
                    {/* Task Content */}
                    <div className="flex-grow">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">{task.name}</h3>
                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTaskStatusBadge(task.status)}`}>
                          {task.status === 'Inprogress' ? 'In Progress' : task.status}
                        </span>
                        {/* Optional: Add creation date */}
                        <span className="text-xs text-gray-400">
                          Created {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Visual Indicator for More Details */}
                  <div className="text-gray-300 group-hover:text-blue-400 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first task for this project.</p>
          {!taskModal && (
            <button 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-flex items-center" 
              onClick={() => { 
                setTaskModal(true);
                setProjectToAddTask(selectedProject);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Task
            </button>
          )}
        </div>
      )}
    </div>
  </div>
)}
                    
         

                    {activeTab === 'attachments' && (

                      <div className="space-y-3 mr-2">
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
      <input 
        type="file" 
        id="attachment-upload" 
        className="hidden" 
        multiple 
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.txt"
        onChange={(e) => handleAttachmentUpdate(e)}
        disabled={isUploading || (selectedProject.attachments?.length >= 10)}
      />
      <label htmlFor="attachment-upload" className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-blue-600">Uploading...</p>
          </div>
        ) : (
          <>
            <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {(selectedProject.attachments?.length >= 10) ? 'Maximum 10 files reached' : 'Upload new attachment'}
            </p>
            <p className="text-xs text-gray-400">
              Max 10 files, up to 5MB each ({10 - (selectedProject.attachments?.length || 0)} remaining)
            </p>
          </>
        )}
      </label>
    </div>

    {!selectedProject.attachments || selectedProject.attachments.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p>No attachments yet</p>
        <p className="text-sm">Upload files to get started</p>
      </div>
    ) : (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">
            Project Files ({selectedProject.attachments.length}/10)
          </h4>
          {selectedProject.attachments.length > 0 && (
            <button 
                onClick={() => {
                // 🎯 ONLY clear current state, keep original for comparison
                setSelectedProject(prev => ({ ...prev, attachments: [] }));
                setAllProjects(prev => 
                  prev.map(project => 
                    project._id === selectedProject._id 
                      ? { ...project, attachments: [] }
                      : project
                  )
                );
              }}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>
        
        {selectedProject.attachments.map((attachment, index) => (
  <div 
    key={index} 
    className="p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/30 transition-all duration-200 w-full group"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-grow">
        {/* File Icon with Enhanced Styling */}
        <div className={`w-12 h-12 rounded-xl ${getFileIconBackground(attachment.type)} flex items-center justify-center shadow-sm`}>
          {getFileIconComponent(attachment.type)}
        </div>
        
        {/* File Content */}
        <div className="flex-grow">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">{attachment.filename}</h3>
          <div className="flex items-center gap-2">
            {/* File Size */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {formatFileSize(attachment.size)}
            </span>
            {/* Upload Date */}
            <span className="text-xs text-gray-400">
              Uploaded {new Date(attachment.uploadedAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center space-x-2 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
        {attachment.type.includes('image') && (
          <button 
            onClick={() => window.open(attachment.url, '_blank')}
            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Preview image"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        <button 
          onClick={() => handleDownload(attachment)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          title="Download file"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          onClick={() => removeAttachmentUpdate(index)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          title="Remove attachment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
))}
      </div>
    )}
    
    <p className="text-xs text-gray-500 text-center">
      {selectedProject.attachments?.length || 0}/10 attachments used
    </p>
  </div>
     
                    )}

                    {activeTab === 'comments' && (
                      <div className="space-y-4 mr-2 mt-2">
                       
                       <div className="flex items-start space-x-4 group">
  {/* Enhanced Avatar Section for Input */}
  <div className="relative flex-shrink-0">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-lg">
      <div className="w-full h-full rounded-full bg-white p-0.5">
        {userData.avatar ? (
          <img 
            alt={userData.firstName} 
            className="w-full h-full rounded-full object-cover ring-2 ring-white shadow-sm" 
            src={userData.avatar} 
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {userData.firstName?.[0]}{userData.lastName?.[0]}
            </span>
          </div>
        )}
      </div>
    </div>
    {/* Online Status Indicator */}
    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
  </div>

  {/* Enhanced Comment Input */}
  <div className="flex-grow min-w-0">
    {/* Comment Input Bubble with Premium Styling */}
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group-hover:border-blue-200">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      
      <div className="relative p-4">
        {/* Header with Name */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-semibold text-gray-900">
              {userData.firstName} {userData.lastName}
            </h4>
            {/* Optional: Role badge */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              You
            </span>
          </div>
          {/* Time indicator */}
          <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-full">
            Now
          </span>
        </div>
        
        {/* Enhanced Textarea */}
        <div className="mb-3">
          <textarea 
            className="w-full p-3 text-sm border-0 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none placeholder-gray-400 transition-all duration-200" 
            placeholder="Share your thoughts..."
            rows="3"
            maxLength={500}

            value={content || ''}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        {/* Enhanced Action Button */}
        <div className="flex justify-end">
          <button 
            className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center shadow-sm ${
              content && content.trim() 
                ? 'text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-purple-700 hover:shadow-md transform hover:scale-105' 
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
            onClick={() => postComment(selectedProject)}
            disabled={loading || !content || !content.trim()}
          >
            {commentloading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Posting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                Post Comment
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Subtle Chat Bubble Tail */}
      <div className="absolute left-0 top-6 transform -translate-x-1 w-3 h-3">
        <div className="w-3 h-3 bg-white border-l border-b border-gray-100 transform rotate-45 shadow-sm"></div>
      </div>
    </div>

    {/* Enhanced Metadata Row */}
    <div className="flex items-center justify-between mt-2 ml-4">
      <div className="flex items-center space-x-3 text-xs text-gray-400">
        <span className="flex items-center space-x-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span>Ready to post</span>
        </span>
      </div>
      
      {/* Character counter (optional) */}
      <div className="text-xs text-gray-400">
        {content ? `${content.length}/500` : '0/500'}
      </div>
    </div>
  </div>
</div>

                        <div className="space-y-4">
                          {projectComments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <MessageCircleOff className="w-6 h-6 text-gray-300" />
                              </div>
                              <p>No comments yet</p>
                              <p className="text-sm">Start the conversation</p>
                            </div>
                          ) : (
                            projectComments.map((comment) => (
                              <div key={comment._id} className="flex items-start space-x-4 group">
  {/* Enhanced Avatar Section */}
  <div className="relative flex-shrink-0">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-lg">
      <div className="w-full h-full rounded-full bg-white p-0.5">
        {comment.createdBy.avatar ? (
          <img 
            alt={comment.createdBy.firstName} 
            className="w-full h-full rounded-full object-cover ring-2 ring-white shadow-sm" 
            src={comment.createdBy.avatar} 
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {comment.createdBy.firstName?.[0]}{comment.createdBy.lastName?.[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Enhanced Comment Content */}
  <div className="flex-grow min-w-0">
    {/* Comment Bubble with Premium Styling */}
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group-hover:border-blue-200">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      
      <div className="relative p-4">
        {/* Header with Name and Time */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {comment.createdBy.firstName} {comment.createdBy.lastName}
            </h4>
            {/* Optional: Role badge */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {userData?.role}
            </span>
          </div>
          {/* Time with enhanced styling */}
          <time className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-full">
            {formatCommentDate(comment.createdAt)}
          </time>
        </div>
        
        {/* Comment Content with Better Typography */}
        <div className="prose prose-sm max-w-none">
          <p className="text-sm text-gray-700 leading-relaxed mb-0 whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
      </div>
      
      {/* Subtle Chat Bubble Tail */}
      <div className="absolute left-0 top-6 transform -translate-x-1 w-3 h-3">
        <div className="w-3 h-3 bg-white border-l border-b border-gray-100 transform rotate-45 shadow-sm"></div>
      </div>
    </div>

    {/* Enhanced Metadata Row */}
    <div className="flex items-center justify-between mt-2 ml-4">
      <div className="flex items-center space-x-3 text-xs text-gray-400">
        <span className="flex items-center space-x-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span>Posted {formatCommentDate(comment.createdAt)}</span>
        </span>
      </div>
      
     
    </div>
  </div>
</div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Sidebar (1/3 width) */}
                <div className="w-1/3 space-y-6">
                  {/* Project Stats Card */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                    <h3 className="text-base font-semibold text-gray-800 mb-3">Project Stats</h3>
                    <div className="space-y-3">
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Project Manager</p>
                        <div className="relative">
                          <div className="flex items-center mb-3">
                            {selectedManager ? (
                              <>
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center w-9 h-9 rounded-full">
        {selectedManager.avatar ? 
          <img alt="Project Manager Avatar" className="h-9 w-9 rounded-full" src={selectedManager.avatar} />
         : 
          <div className='text-white font-normal'>
            {selectedManager.firstName?.[0]}{selectedManager.lastName?.[0]}
          </div>
        }
      </div>
                             <div className="flex-grow ml-3">
        <span className="text-sm font-medium text-gray-800 block">
          {selectedManager.firstName} {selectedManager.lastName}
        </span>
      </div>
                              </>
                            ) : (
                              <div className="flex items-center flex-grow mb-1.5">
                                <div className="w-10 h-10 bg-gray-200 rounded- flex items-center rounded-2xl justify-center mr-3">
                                  <User className="w-5 h-5  text-gray-400" />
                                </div>
                                <span className="text-sm text-gray-500">No manager assigned</span>
                              </div>
                            )}
                            <button 
                              onClick={() => setShowManageManagerModal(true)}
                              className="ml-3 text-xs font-medium text-white bg-blue-600 hover:from-indigo-700 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                            >
                              {selectedManager ? 'Change' : 'Assign'}
                            </button>
                          </div>

                          {/* Manager Modal - Updated to show selected at top */}
                          {showManageManagerModal && (
                            <>
                              <div 
                                className="fixed inset-0 z-[9998]" 
                                onClick={() => { 
    setShowManageManagerModal(false); }}
                              ></div>
                              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] max-h-72 overflow-hidden animate-fade-in">
                                <div className="p-3">
                                  <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900">Select Manager</h3>
                                    <button 
                                      onClick={() => setShowManageManagerModal(false)}
                                      className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                      <CircleX className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <div className="mb-2">
                                    <h4 className="text-gray-500 uppercase text-xs mb-2 font-light tracking-wide">Available Users</h4>
                                    <div className="space-y-1 max-h-32 overflow-y-auto modal-scrollbar">
                                      {/* Show selected manager first if exists */}
                                      {selectedManager && (
                                        <div 
                                          key={selectedManager._id} 
                                          className="flex items-center justify-between p-1.5 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer group"
                                          onClick={() => {
                                              selectManagerForProject(selectedManager)  // ✅ CORRECT

                                            setShowManageManagerModal(false)
}}
                                        >
                                          <div className="flex items-center space-x-2">
                                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center w-9 h-9 rounded-full">
  {selectedManager?.avatar ? (
    <img alt="Project Manager Avatar" className=" h-9 w-9 rounded-full  shadow-sm" src={selectedManager.avatar} />
  ) : (
    selectedManager ? (
<div className='text-white font-normal'>
  {selectedManager?.firstName?.[0] || ''}
  {selectedManager?.lastName?.[0] || ''}
</div>    ) : (
      <User className="w-5 h-5 text-gray-400" />
    )
  )}
</div>                                            <div>
                                           <p className="text-xs font-medium text-blue-900 truncate max-w-24">
  {(selectedManager?.firstName || '') + ' ' + (selectedManager?.lastName || '')}
</p>
<p className="text-xs text-blue-600 truncate max-w-44">
  {selectedManager?.email || ''}
</p>
                                            </div>
                                          </div>
                                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                                        </div>
                                      )}
                                      
                                      {/* Show other users */}
                                      {allAvailableUsers.length === 0 ? (
                                         <div className="text-center py-4 text-gray-500">
    <p className="text-xs">Loading available users...</p>
  </div>
) : (
  allAvailableUsers
    .filter(user => !selectedManager || selectedManager._id !== user._id) // Added null check
    .map((user) => (
    <div 
      key={user._id} 
      className="flex items-center justify-between p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group"
      onClick={() => {
         console.log('🔧 Selecting manager:', user);
  if (showProjectModal) {
    // For project editing
    selectManagerForProject(user);
  } else {
    // For project creation
    selectManager(user);
  }
  setShowManageManagerModal(false);
      }}
    >
      <div className="flex items-center space-x-2">
        <div className='bg-gradient-to-br from-blue-500 to-blue-600 w-9 h-9 rounded-full flex flex-col items-center justify-center'>
          {user.avatar ? (
            <img src={user.avatar} alt={user.firstName} className="w-9 h-9 rounded-full" /> 
          ) : (
            <div className='text-white font-normal'>{user?.firstName[0]+user?.lastName[0]}</div>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-900 truncate max-w-24">{user.firstName+' '+user.lastName}</p>
          <p className="text-xs text-gray-500 truncate max-w-44">{user.email}</p>
        </div>
      </div>
    </div>
  ))
                                      )}
                                    </div>
                                  </div>

                                  {selectedManager && (
                                    <div className="pt-2 border-t border-gray-200">
                                      <button 
                                        onClick={() => {
                                          removeManagerFromProject();
    setShowManageManagerModal(false);
                                        }}
                                        className="w-full text-xs text-red-600 hover:text-red-700 py-1"
                                      >
                                        Remove Manager
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="pt-4 border-t border-gray-200">
  <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Project Summary</p>
  <div className="space-y-2 text-sm">
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Members:</span>
      <span className="font-medium text-gray-800">{selectedMembers.length}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Teams:</span>
      <span className="font-medium text-gray-800">{selectedTeams.length}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Status:</span>
      <span className="font-medium text-gray-800">{selectedProject.status || 'Not set'}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Visibility:</span>
      <span className="font-medium text-gray-800 capitalize">{selectedProject.visibility || 'Private'}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Attachments:</span>
      <span className="font-medium text-gray-800">{selectedProject.attachments?.length || 0}</span>
    </div>
  </div>
</div>
                        
                      </div>
                    </div>

{selectedMembers.length > 0 && (
  <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 mb-6">
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center">
     
      <h3 className="text-sm font-normal text-gray-700">Selected Members</h3>
    </div>
    <div className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200">
      {selectedMembers.length} 
    </div>
  </div>
  
  <div className="space-y-3">
    {selectedMembers.map((member, index) => (
      <div key={member._id} className="group p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all duration-150">
        <div className="flex items-center space-x-1.5">
          <div className="relative flex-shrink-0">
            <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white'>
              {member.avatar ? 
                <img src={member.avatar} className='w-10 h-10 rounded-full object-cover' alt={member.firstName}/> : 
                <div className='text-white font-medium text-sm'>
                  {(member?.firstName?.[0] || '') + (member?.lastName?.[0] || '')}
                </div>
              }
            </div>
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {member.firstName} {member.lastName}
            </p>
            <p
  className="text-xs text-gray-500 font-medium overflow-hidden text-ellipsis whitespace-nowrap "
  title={member.email}
>
  {member.email}
</p>          </div>
          <div className="flex items-center space-x-2">
            
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
)}

{selectedTeams.length > 0 && (
  <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 mb-6">
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center">
     
      <h3 className="text-sm font-normal text-gray-700">Selected Teams</h3>
    </div>
    <div className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200">
      {selectedTeams.length} 
    </div>
  </div>
  
  <div className="space-y-3">
    {selectedTeams.map((team, index) => (
      <div key={team._id} className="group p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all duration-150">
        <div className="flex items-center space-x-1.5">
          <div className="relative flex-shrink-0">
            <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white'>
             
                <div className='text-white font-medium text-sm'>
                  {getInitials(team.name)}
                </div>
             
            </div>
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {team.name}
            </p>
            <p className="text-xs text-gray-500 font-medium overflow-hidden text-ellipsis whitespace-nowrap ">
  {team.description}</p>
            </div>
          
        </div>
      </div>
    ))}
  </div>
</div>
)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <img alt="Creator avatar" className="h-8 w-8 rounded-full mr-2" src={selectedProject.entrepriseId?.owner?.avatar} />
                <p className="text-sm text-gray-600">Created by <span className="font-medium">{selectedProject.entrepriseId?.owner?.firstName+' '+selectedProject.entrepriseId?.owner?.lastName}</span></p>
              </div>
              <div className="flex space-x-2">
        
       <button 
    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center transition-colors" 
    onClick={()=>{handleUpdate(selectedProject)}}
    disabled={loading}
>
    {loading ? (
          <>
            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Saving...
        </>
    ) : (
        <>
            <Save className="w-4 h-4 mr-1" />
            Save Changes
        </>
    )}
</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Create Project Modal */}
     
     {projectModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0 bg-black/20 backdrop-blur-sm">
    <div className="bg-white w-full max-w-5xl md:w-[900px] rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col create-modal-animate">
      <style jsx>{`
         /* Main modal scrollbar - smoother and darker */
        .create-modal-scrollbar {
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: #1e40af transparent;
        }
        .create-modal-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .create-modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .create-modal-scrollbar::-webkit-scrollbar-thumb {
          background: #1e40af;
          border-radius: 3px;
        }
        .create-modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1d4ed8;
        }
        
        .project-logo-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          border-radius: 0.5rem;
        }
        
        .project-logo-container:hover .project-logo-overlay {
          opacity: 1;
        }
        
        .status-planning {
          background-color: #e0f2fe;
          color: #0ea5e9;
        }
        .status-progress {
          background-color: #fef9c3;
          color: #eab308;
        }
        .status-completed {
          background-color: #dcfce7;
          color: #22c55e;
        }
        .status-onhold {
          background-color: #fee2e2;
          color: #ef4444;
        }
        
        /* Modal scrollbars - darker blue and smoother */
        .modal-scrollbar {
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: #1e40af transparent;
        }
        .modal-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb {
          background: #1e40af;
          border-radius: 2px;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1d4ed8;
        }

        /* Attachment scrollbar */
        .attachment-scrollbar {
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: #1e40af transparent;
        }
        .attachment-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .attachment-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .attachment-scrollbar::-webkit-scrollbar-thumb {
          background: #1e40af;
          border-radius: 3px;
        }
        .attachment-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1d4ed8;
        }
        @keyframes fadeTab {
  from { opacity: 0; transform: translateY(12px);}
  to { opacity: 1; transform: translateY(0);}
}
.animate-fade-tab {
  animation: fadeTab 0.25s cubic-bezier(.4,0,.2,1);
}
      `}</style>

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-gray-500">Create New Project</p>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-blue-600 hover:bg-gray-50/80 hover:backdrop-blur-sm rounded-full p-1.5 transition-all duration-300 hover:shadow-lg hover:scale-105" onClick={() => {setProjectModal(false) ,   setProjectData({
      name: "",
      description: "",
      manager: "",
      teams: [],
      members: [],
      attachments: [],
      dueDate: "",
      visibility: "",
      status: "",
      avatarUrl: "",
    }) ,
    setSelectedMembers([]) ,
    setSelectedTeams([]) ,
    setSelectedManager(null) ,
    setUploadedAttachments([])}}>
              <CircleX className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Project Name and Logo Section */}
        <div className="flex items-start space-x-4 mb-2">
          <div className="relative project-logo-container">
            <div
  className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl cursor-pointer ${
    project.avatarUrl ? 'bg-transparent' : 'bg-blue-600'
  }`}
>
  {project.avatarUrl ? (
    <img src={project.avatarUrl} alt="Project" className="w-16 h-16 rounded-lg object-cover" />
  ) : (
    <Plus className="w-8 h-8" />
  )}
</div>
            <div className="project-logo-overlay">
              <input 
                type="file" 
                id="create-project-logo-upload" 
                className="hidden" 
                accept=".jpg,.jpeg,.png,.gif"
                onChange={(e) => handleAvatar(e)}
              />
              <label htmlFor="create-project-logo-upload" className="cursor-pointer text-white text-xs font-medium">
                Edit Pic
              </label>
            </div>
          </div>
          
          <div className="flex-grow">
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProjectData(prev => ({...prev, name: e.target.value}))}
              className="text-2xl font-semibold text-gray-900 bg-transparent border-none outline-none w-full placeholder-gray-400"
              placeholder="Project Name"
            />
            <textarea
              value={project.description}
              onChange={(e) => setProjectData(prev => ({...prev, description: e.target.value}))}
              rows={2}
              className="mt-2 text-sm text-gray-600 bg-transparent border-none outline-none w-full resize-none placeholder-gray-400"
              placeholder="Project description..."
            />
           
            <div className="">
            <FormControl sx={{  minWidth: 180 }}>
  <InputLabel id="demo-simple-select-label">Status</InputLabel>
  <Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    label="Status"
     MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: 3, // `3` = theme.spacing(3) = 24px; use 2 for 16px
              boxShadow: 3, // Optional: Add slight shadow for elevation
            },
          },
        }}
        onChange={(e)=>{setProjectData(prev=>({...prev,status:e.target.value}))}}
   
  >
    <MenuItem value='Planning'>Planning </MenuItem>
    <MenuItem value='In Progress'>In Progress</MenuItem>
    <MenuItem value='Completed'>Completed</MenuItem>
    <MenuItem value='On Hold'>On Hold</MenuItem>
  </Select>
</FormControl>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-grow overflow-y-auto create-modal-scrollbar">
        <div className="p-6 flex gap-6">
          {/* Left Column - Main Content (2/3 width) */}
          <div className="w-2/3 space-y-6">
            {/* Project Info Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
              <div className='mt-4'>
  <FormControl fullWidth>
  <InputLabel id="demo-simple-select-label">Project Visibility</InputLabel>
  <Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    label="Project Visibility"
    MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: 3, // `3` = theme.spacing(3) = 24px; use 2 for 16px
              boxShadow: 3, // Optional: Add slight shadow for elevation
            },
          },
        }}
        onChange={(e)=>{setProjectData(prev=>({...prev,visibility:e.target.value}))}}
   
  >
    <MenuItem value='public'>Public</MenuItem>
    <MenuItem value='private'>Private</MenuItem>
  </Select>
</FormControl>
</div>
      <div className='mt-4'>
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker 
      label="Due Date" 
      name="DueDate"
      onChange={(value)=>{setProjectData(prev=>({...prev,dueDate:value ? value.toISOString() : null}))}}
       slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 4],
                },
              },
            ],
          },
          paperContent: {
            sx: {
              borderRadius: '16px',     // rounded-2xl
              padding: 1,                // reduce default padding
              minHeight: 220,
              maxHeight: 320,            // reduce overall height
              overflow: 'hidden',
            },
          },
        }}
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': {
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: '#d1d5db',
              borderRadius: '0.5rem',
            },
            '&:hover fieldset': {
              borderColor: '#2563eb',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: '2px',
              boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            color: '#6b7280',
            '&.Mui-focused': {
              color: '#2563eb',
            },
          },
          '& .MuiInputBase-input': {
            padding: '8px 14px',
            height: 'auto',
          },
          '& .MuiIconButton-root': {
            color: '#6b7280',
            '&:hover': {
              color: '#2563eb',
            },
          },
        }}
    />
  </LocalizationProvider>
</div>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <div className="relative">
                  <button 
                    onClick={() => setShowManageMembersModal(true)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Manage Members</span>
                  </button>
                  
                  {showManageMembersModal && (
                    <>
                      <div 
                        className="fixed inset-0 z-[9998] animate-fade-in" 
                        onClick={() => setShowManageMembersModal(false)}
                      ></div>
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] max-h-72 overflow-hidden animate-fade-in">
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-900">Manage Members</h3>
                            <button 
                              onClick={() => setShowManageMembersModal(false)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <CircleX className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mb-3">
                            <div className="relative">
                              <div className="border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600 transition-all">
                                {selectedMembers.length > 0 && (
                                  <div className="p-2 border-b border-gray-100">
                                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto modal-scrollbar">
                                       {selectedMembers.map((member) => (
  <div key={member._id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-0.5 py-0.5 rounded-full text-xs flex-shrink-0">
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col justify-center items-center">
      {member.avatar ? (
        <img src={member.avatar} alt={member.firstName} className="w-6 h-6 rounded-full" />
      ) : (
        <div className='text-white font-normal'>{(member?.firstName?.[0] || '') + (member?.lastName?.[0] || '')}</div>
      )}
    </div>
    <span className="text-xs truncate max-w-16">{member.firstName}</span>
    <button 
onClick={() => removeMember(member._id)}
className="hover:text-blue-900"
    >
      <CircleX className="w-2.5 h-2.5" />
    </button>
  </div>
))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="p-2">
                                  <input 
                                    type="text"
                                    placeholder={selectedMembers.length > 0 ? "Add more members..." : "Search and add members..."}
                                    className="w-full outline-none text-xs placeholder-gray-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-2">
                            <h4 className="text-gray-500 uppercase text-xs mb-2 font-light tracking-wide">Available Members</h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto modal-scrollbar pb-4">
                              {allAvailableUsers.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">
                                  <p className="text-xs">No available members...</p>
                                </div>
                              ) : (
                                allAvailableUsers
                                  .filter(user => !selectedMembers.find(member => member._id === user._id))
                                .map((user) => (
                                  <div 
                                    key={user.id} 
                                    className="flex items-center justify-between p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group"
                                    onClick={() => addMember(user)}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-9 h-9 flex flex-col items-center justify-center ">{user.avatar ? <img src={user.avatar} alt={user.firstName} className="w-9 h-9 rounded-full" /> : <div className="text-white font-normal">{user.firstName[0]+''+user.lastName[0]}</div>}</div>
                                      <div>
                                        <p className="text-xs font-medium text-gray-900 truncate max-w-24">{user.firstName+' '+user.lastName}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-44">{user.email}</p>
                                      </div>
                                    </div>
                                    <Plus className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setShowManageTeamsModal(true)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Manage Teams</span>
                  </button>

                  {showManageTeamsModal && (
                    <>
                      <div 
                        className="fixed inset-0 z-[9998] animate-fade-in" 
                        onClick={() => setShowManageTeamsModal(false)}
                      ></div>
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] max-h-72 overflow-hidden animate-fade-in">
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-900">Manage Teams</h3>
                            <button 
                              onClick={() => setShowManageTeamsModal(false)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <CircleX className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mb-3">
                            <div className="relative">
                              <div className="border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600 transition-all">
                                {selectedTeams.length > 0 && (
                                  <div className="p-2 border-b border-gray-100">
                                    <div className="flex flex-wrap gap-1 h-8 overflow-y-auto modal-scrollbar">
                                      {selectedTeams.map((team) => (
                                        <div key={team._id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-0.5 py-0.5 rounded-full text-xs flex-shrink-0">
                                          <div className={`w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-[13px] font-bold`}>
                                           <div className='text-white font-medium'>{getTeamInitials(team.name)}</div>
                                          </div>
                                          <span className="text-[13px] truncate max-w-16">{team.name.split(' ')[0]}</span>
                                          <button 
                                            onClick={() => removeTeam(team._id)}
                                            className="hover:text-blue-900"
                                          >
                                            <CircleX className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="p-2">
                                  <input 
                                    type="text"
                                    placeholder={selectedTeams.length > 0 ? "Add more teams..." : "Search and add teams..."}
                                    className="w-full outline-none text-xs placeholder-gray-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-2">
                            <h4 className="text-gray-500 uppercase text-xs mb-2 font-light tracking-wide">Available Teams</h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto modal-scrollbar pb-4">
                              {allAvailableTeams
                                .filter(team => !selectedTeams.find(t => t._id === team._id))
                                .map((team) => (
                                  <div 
                                    key={team._id} 
                                    className="flex items-center justify-between p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group"
onClick={() => addTeam(team)}
>
                                    <div className="flex items-center space-x-2">
<div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-blue-600 to-blue-700`}>
                                           <div className='text-white font-normal'>{getTeamInitials(team.name)}</div>

                                      </div>
                                      <div>
                                        <p className="text-[13px] font-medium text-gray-900 truncate max-w-24">{team.name}</p>
                                        
                                      </div>
                                    </div>
                                    <Plus className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Attachments Section */}
             
             <div className="space-y-3">
  <h3 className="text-base font-semibold text-gray-800">Project Attachments</h3>
  
  {/* Upload Area */}
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
    <input 
      type="file" 
      id="create-attachment-upload" 
      className="hidden" 
      onChange={(e) => handleAttachement(e)}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.txt"
      multiple // Enable multiple file selection
      disabled={isUploading || uploadedAttachments.length >= 10}
    />
    <label htmlFor="create-attachment-upload" className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
      {isUploading ? (
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-blue-600">Uploading...</p>
        </div>
      ) : (
        <>
          <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {uploadedAttachments.length >= 10 ? 'Maximum 10 files reached' : 'Upload project attachments'}
          </p>
          <p className="text-xs text-gray-400">
            Max 10 files, up to 5MB each ({10 - uploadedAttachments.length} remaining)
          </p>
        </>
      )}
    </label>
  </div>

  {/* Preview Section */}
  {uploadedAttachments.length > 0 && (
    <div className="space-y-2">
  <div className="flex items-center justify-between">
    <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({uploadedAttachments.length}/10)</h4>
    <button 
      onClick={() => {
        setUploadedAttachments([]);
        setProjectData(prev => ({...prev, attachments: []}));
      }}
      className="text-xs text-red-600 hover:text-red-700"
    >
      Clear All
    </button>
  </div>
  
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-fit ">
    <div className="space-y-2">
      {uploadedAttachments.map((attachment, index) => (
        <div key={index} className="flex items-center p-3 rounded-xl bg-white hover:bg-blue-50/50 transition-all duration-200 border border-blue-600/20 hover:border-blue-600/40 shadow-sm hover:shadow-md">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${getFileIconBackground(attachment.type)}`}>
            {getFileIconComponent(attachment.type)}
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{attachment.filename}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
              <span className="font-medium">{formatFileSize(attachment.size)}</span>
              <span className="text-blue-400">•</span>
              <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                {attachment.type.split('/')[1]}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {/* Preview button for images */}
            {attachment.type.includes('image') && (
              <button 
                onClick={() => window.open(attachment.url, '_blank')}
                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Preview image"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {/* Download button */}
            <button 
              onClick={() => {handleDownload(attachment)}}
              className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
            {/* Remove button */}
            <button 
              onClick={() => removeAttachment(index)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
  )}
</div>
          </div>

          {/* Right Column - Sidebar (1/3 width) */}
          <div className="w-1/3 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-xl">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Project Setup</h3>
              <div className="space-y-3">
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Project Manager</p>
                  <div className="relative">
                    <div className="flex items-center mb-1.5">
                      {selectedManager ? (
                        <>
                  <div className="bg-blue w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex flex-col items-center justify-center mr-1.5">{selectedManager.avatar ? <img alt="Project Manager Avatar" className=" h-9 w-9 rounded-full " src={selectedManager.avatar} /> : <div className='text-white font-normal'>{selectedManager.firstName[0]+selectedManager.lastName[0]}</div>}</div> 
                          <div className="flex-grow">
                            <span className="text-sm font-medium text-gray-800 block">{selectedManager.firstName+' '+selectedManager.lastName}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center flex-grow mb-1.5">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-500">No manager assigned</span>
                        </div>
                      )}
                      <button 
                        onClick={() => setShowManageManagerModal(true)}
                        className="ml-3 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                      >
                        {selectedManager ? 'Change' : 'Assign'}
                      </button>
                    </div>

                    {showManageManagerModal && (
                      <>
                        <div 
                          className="fixed inset-0 z-[9998]" 
                          onClick={() => setShowManageManagerModal(false)}
                        ></div>
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] max-h-72 overflow-hidden animate-fade-in">
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-semibold text-gray-900">Select Manager</h3>
                              <button 
                                onClick={() => setShowManageManagerModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <CircleX className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="mb-2">
                              <h4 className="text-gray-500 uppercase text-xs mb-2 font-light tracking-wide">Available Users</h4>
                              <div className="space-y-1 max-h-32 overflow-y-auto modal-scrollbar">
                                {selectedManager && (
                                  <div 
                                    key={selectedManager._id} 
                                    className="flex items-center justify-between p-1.5 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer group"
                                    onClick={() => {
                                      selectManager(selectedManager)
                                      setShowManageManagerModal(false)
                                    }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div className='bg-gradient-to-br from-blue-500 to-blue-600 w-9 h-9 rounded-full flex items-center justify-center'>{selectedManager.avatar ? <img src={selectedManager.avatar} alt={selectedManager.firstName} className="w-9 h-9 rounded-full" /> : <div className='text-white font-normal'>{selectedManager.firstName[0]+selectedManager.lastName[0]}</div> }</div><div>
                                        <p className="text-xs font-medium text-blue-900 truncate max-w-24">{selectedManager.firstName+' '+selectedManager.lastName}</p>
                                        <p className="text-xs text-blue-600 truncate max-w-44">{selectedManager.email}</p>
                                      </div>
                                    </div>
                                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                                  </div>
                                )}
                                
                                {allAvailableUsers
                                  .filter(user => !selectedManager || selectedManager._id !== user._id)
                                  .map((user) => (
                                    <div 
                                      key={user._id} 
                                      className="flex items-center justify-between p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group"
                                      onClick={() => {
                                        selectManager(user)
                                        setShowManageManagerModal(false)
                                      }}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <div className='bg-gradient-to-br from-blue-500 to-blue-600 w-9 h-9 rounded-full flex items-center justify-center'>{user.avatar ? <img src={user.avatar} alt={user.firstName} className="w-9 h-9 rounded-full" /> : <div className='text-white font-normal'>{user.firstName[0]+user.lastName[0]}</div> }</div>                                        <div>
                                          <p className="text-xs font-medium text-gray-900 truncate max-w-24">{user.firstName+' '+user.lastName}</p>
                                          <p className="text-xs text-gray-500 truncate max-w-44">{user.email}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            {selectedManager && (
                              <div className="pt-2 border-t border-gray-200">
                                <button 
                                  onClick={() => {
                                    removeManager()
                                    setShowManageManagerModal(false)
                                  }}
                                  className="w-full text-xs text-red-600 hover:text-red-700 py-1"
                                >
                                  Remove Manager
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Project Summary</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Members:</span>
                        <span className="font-medium text-gray-800">{selectedMembers.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Teams:</span>
                        <span className="font-medium text-gray-800">{selectedTeams.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-gray-800">{project.status || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedMembers.length > 0 && (
                <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 mb-6 animate-fade-in">
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center">
     
      <h3 className="text-sm font-normal text-gray-700">Selected Members</h3>
    </div>
    <div className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200">
      {selectedMembers.length} 
    </div>
  </div>
  
  <div className="space-y-3">
    {selectedMembers.map((member, index) => (
      <div key={member._id} className="group p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all duration-150">
        <div className="flex items-center space-x-1.5">
          <div className="relative flex-shrink-0">
            <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white'>
              {member.avatar ? 
                <img src={member.avatar} className='w-10 h-10 rounded-full object-cover' alt={member.firstName}/> : 
                <div className='text-white font-medium text-sm'>
                  {(member?.firstName?.[0] || '') + (member?.lastName?.[0] || '')}
                </div>
              }
            </div>
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {member.firstName} {member.lastName}
            </p>
            <p
  className="text-xs text-gray-500 font-medium overflow-hidden text-ellipsis whitespace-nowrap "
  title={member.email}
>
  {member.email}
</p>          </div>
          <div className="flex items-center space-x-2">
            
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
              )}

              {selectedTeams.length > 0 && (
                
                      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 mb-6 animate-fade-in">
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center">
     
      <h3 className="text-sm font-normal text-gray-700">Selected Teams</h3>
    </div>
    <div className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200">
      {selectedTeams.length} 
    </div>
  </div>
  
  <div className="space-y-3">
      {selectedTeams.map((team, index) => (
      <div key={team._id} className="group p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all duration-150">
        <div className="flex items-center space-x-1.5">
          <div className="relative flex-shrink-0">
            <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white'>
             
                <div className='text-white font-medium text-sm'>
                  {getTeamInitials(team.name)}
                </div>
              
            </div>
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {team.name}
            </p>
            <p
  className="text-xs text-gray-500 font-medium overflow-hidden text-ellipsis whitespace-nowrap "
  title={team.description}
>
  {team.description}
</p>          </div>
          <div className="flex items-center space-x-2">
            
          </div>
        </div>
      </div>
    ))}
    </div>
  </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
      <div className='bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center w-9 h-9 rounded-full mr-2'>{userData.avatar ? <img src={userData.avatar} className='w-9 h-9 rounded-full'/> : <div className='text-white font-normal'>{userData.firstName[0]+userData.lastName[0]}</div>}</div>

          <p className="text-sm text-gray-600">Created by <span className="font-medium">{userData.firstName+' '+userData.lastName}</span></p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => { setProjectModal(false),setProjectData({
      name: "",
      description: "",
      manager: "",
      teams: [],
      members: [],
      attachments: [],
      dueDate: "",
      visibility: "",
      status: "",
      avatarUrl: "",
    }) ,
    setSelectedMembers([]) ,
    setSelectedTeams([]) ,
    setSelectedManager(null) ,
    setUploadedAttachments([])}}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={createProject}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center transition-colors${
        loading 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700'
      }`}
    >
            {loading ? (
        <>
          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Creating...
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 mr-1" />
          Create Project
        </>
      )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
 {showSuccessModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div 
            className="fixed inset-0" 
            onClick={() => setShowSuccessModal(false)}
          ></div>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative z-10 animate-fade-in">
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
              Go to Project Board
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div 
            className="fixed inset-0" 
            onClick={() => setShowErrorModal(false)}
          ></div>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative z-10 animate-fade-in">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Validation Error</h3>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{errorMessage}</p>
            <button 
              onClick={() =>{ setShowErrorModal(false)     , setLoading(false)}}
              className="w-full px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              OK            </button>
          </div>
        </div>
      )}
      {showDeleteConfirmModal && projectToDelete && (
  <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
    <div 
      className="fixed inset-0" 
      onClick={() => {
        setShowDeleteConfirmModal(false);
        setProjectToDelete(null);
      }}
    ></div>
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative z-10 animate-fade-in">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Project</h3>
        </div>
      </div>
      
      <p className="text-gray-700 mb-2">
        Are you sure you want to delete <span className="font-semibold">"{projectToDelete.name}"</span>?
      </p>
      <p className="text-sm text-gray-500 mb-6">
        This action cannot be undone. All project data, tasks, and attachments will be permanently removed.
      </p>
      
      <div className="flex space-x-3">
        <button 
          onClick={() => {
            setShowDeleteConfirmModal(false);
            setProjectToDelete(null);
          }}
          disabled={loading}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
        >
          No, Cancel
        </button>
        <button 
          onClick={() => deleteProject(projectToDelete._id)}
          disabled={loading}
          className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-2" />
              Yes, Delete
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
{showCloseConfirmModal && (
  <div className="fixed inset-0 z-[10004] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
    <div 
      className="fixed inset-0" 
      onClick={() => setShowCloseConfirmModal(false)}
    ></div>
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative z-10 border border-gray-200 animate-fade-in">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Unsaved Changes</h3>
        </div>
      </div>
      
      <p className="text-gray-700 mb-2">
        You have unsaved changes to this project.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Would you like to save your changes before closing, or discard them?
      </p>
      
      <div className="flex space-x-3">
        <button 
          onClick={discardChangesAndClose}
          disabled={loading}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
        >
          Discard Changes
        </button>
        <button 
          onClick={saveChangesAndClose}
          disabled={loading}
          className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save & Close
            </>
          )}
        </button>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button 
          onClick={() => setShowCloseConfirmModal(false)}
          className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Continue Editing
        </button>
      </div>
    </div>
  </div>
)}



    </div>
  )
}

export default ProjectBoardAdmin
