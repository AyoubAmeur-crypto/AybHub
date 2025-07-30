// TaskCard.jsx
import React, { useState,useEffect } from 'react';
import { 
  Trash2, 
  Calendar, 
  SquarePen, 
  MessageSquare, 
  Paperclip, 
  AlertTriangle, 
  ArrowRight, 
  Plus, 
  Crown,
  User, 
  Save,
  Settings, 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  CircleX, 
  FileText,         
  FileSpreadsheet,  
  Archive,         
  File  ,
  Image  ,
  Download, Eye
} from "lucide-react";

import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import axios from 'axios';
import UseFetch from '../../../hooks/UseFetch';

function TaskCardWorker({ task, setTasks,fetchTasks, columnId, onDragStart, onDragEnd, index, projectId }) {
  
  
    const [loading, setLoading] = useState(false)
   
    const userData = UseFetch()
  

const [selectedMembers, setSelectedMembers] = useState([]);   // For selected members in sidebar/modal
const [selectedTeams, setSelectedTeams] = useState([]);  
const [showTaskModal, setShowTaskModal] = useState(false);
const [selectedTask, setSelectedTask] = useState(task);
const [warningModal, setWarningModal] = useState(false);

// Title & Description editing
const [isEditingTaskTitle, setIsEditingTaskTitle] = useState(false);
const [isEditingTaskDescription, setIsEditingTaskDescription] = useState(false);
const [editedTaskTitle, setEditedTaskTitle] = useState(task.name || '');
const [editedTaskDescription, setEditedTaskDescription] = useState(task.description || '');

// Status, Due Date, Created Date
const [taskPriority, setTaskPriority] = useState(task.status || '');
const [taskDueDate, setTaskDueDate] = useState(task.due || null);

// Members & Teams
const [taskMembers, setTaskMembers] = useState(task.assignedTo || []);
const [taskTeams, setTaskTeams] = useState(task.team || []);
const [showManageTaskMembersModal, setShowManageTaskMembersModal] = useState(false);
const [showManageTaskTeamsModal, setShowManageTaskTeamsModal] = useState(false);
const [allAvailableUsers, setAllAvailableUsers] = useState([]); // You may want to fetch this
const [allAvailableTeams, setAllAvailableTeams] = useState([]);

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
// Attachments
const [taskAttachments, setTaskAttachments] = useState([]);
const [isUploading, setIsUploading] = useState(false);

//labels

const [showLabelModal, setShowLabelModal] = useState(false);
const [newLabelName, setNewLabelName] = useState('');
const [newLabelColor, setNewLabelColor] = useState('blue');
const [taskLabels, setTaskLabels] = useState(selectedTask?.label || []);
const labelColors = [
  'red', 'blue', 'green', 'lightgreen', 'purple', 'pink', 'lightblue'
];
const [showErrorModal,setshowErrorModal]=useState(false)

/// SUBTASK

const [SubTaskModal,setSubTaskModal]=useState(false)
const [subTasks, setSubTasks] = useState([]);
const [newSubTaskName, setNewSubTaskName] = useState('');
const [showSubTaskModal, setShowSubTaskModal] = useState(false);
const [subTasksFetched, setSubTasksFetched] = useState([]);
const [selectedTaskForSubtasks, setSelectedTaskForSubtasks] = useState(null);

const fetchSubTasksForTask = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/task/api/subtasks/${selectedTask._id}`, { withCredentials: true });
    setSubTasksFetched(res.data.subTasks || []);
    console.log(res.data);
    
  } catch (error) {
    setSubTasksFetched([]);
  }
};

const handleCheckSubTask = async (idx) => {
  try {
    await axios.post(
      `http://localhost:3000/task/api/checkSubtask/${selectedTask._id}`,
      { idx: idx },
      { withCredentials: true }
    );
    fetchSubTasksForTask();
  } catch (error) {
    // Optionally show error
  }
};







// Comments
const [taskComments, setTaskComments] = useState(task.comments || []);
const [commentContent, setCommentContent] = useState('');
const [commentLoading, setCommentLoading] = useState(false);

// change trigger 
const [hasTaskChanges,setTaskChange]=useState(false)

// Tabs
const [activeTab, setActiveTab] = useState('tasks');

const handleClose = ()=>{


  if(hasTaskChanges){

    setWarningModal(true)
  }
  else{
    setShowTaskModal(false)
  }
}

const discardChanges = ()=>{

setTaskLabels(task.label || []);
  setTaskMembers(task.assignedTo || []);
  setTaskTeams(task.team || []);
  setTaskPriority(task.priority || '');
  setTaskDueDate(task.due || null);
  setSelectedMembers(task.assignedTo || []);
  setSelectedTeams(task.team || []);
    setTaskAttachments(task.attachments || []); // <-- This restores original attachments

  setTaskAttachments(task.attachments || []);
  // Close warning and modal
  setWarningModal(false);
  setShowTaskModal(false);
  setTaskChange(false);

}
useEffect(() => {
    



    
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
        fetchTeam()
        
      } catch (error) {

        console.log("can't fetch data from backend due to this",error);
        
        
      }finally{

        setLoading(false)
      }
    }
  }, [userData.id,selectedTask])

 

 useEffect(() => {
  setSelectedTask(task);
  setTaskLabels(task.label || []);
  setTaskMembers(task.assignedTo || []);
  setTaskTeams(task.team || []);
  setTaskPriority(task.priority || '');
  setTaskDueDate(task.due || null);
  setSelectedMembers(task.assignedTo || []);
  setSelectedTeams(task.team || []);
  setTaskAttachments(task.attachments || []); // <-- Make sure this is here!

}, [task]);
useEffect(() => {
  if (selectedTask) {
    fetchSubTasksForTask();
    fetchAvailableComment()
  }
}, [selectedTask]);



// Title edit handlers









const handleUpdate = async ()=> {
   
  setLoading(true)

    let updateAvailableCHANGES = {};

   updateAvailableCHANGES.name = editedTaskTitle.trim();
updateAvailableCHANGES.description = editedTaskDescription.trim();
  if (taskPriority && taskPriority !== task.priority) {
    updateAvailableCHANGES.priority = taskPriority;
  }
  if (taskDueDate && taskDueDate !== selectedTask.due) {
    updateAvailableCHANGES.due = taskDueDate;
  }
  if (taskLabels && JSON.stringify(taskLabels) !== JSON.stringify(selectedTask.label)) {
    updateAvailableCHANGES.label = taskLabels;
  }
  if (selectedMembers && JSON.stringify(selectedMembers) !== JSON.stringify(selectedTask.members)) {
    updateAvailableCHANGES.assignedTo = selectedMembers;
  }
  if (selectedTeams && JSON.stringify(selectedTeams) !== JSON.stringify(selectedTask.teams)) {
    updateAvailableCHANGES.team = selectedTeams;
  }
   if (taskAttachments && JSON.stringify(taskAttachments) !== JSON.stringify(selectedTask.attachments)) {
    updateAvailableCHANGES.attachments = taskAttachments;
  }
  try {

    const MassiveUpdate = await axios.post(`http://localhost:3000/task/api/massiveUpdate/${selectedTask._id}`,{updateAvailableCHANGES:updateAvailableCHANGES},{withCredentials:true})

    await fetchTasks()
    setShowTaskModal(false)
    updateAvailableCHANGES=null
    setSelectedTask(null)
    if(MassiveUpdate){

          console.log("task updated successfully");
          console.log("massive update server response ",MassiveUpdate.data);

          setWarningModal(false)
          setTaskChange(false)
          

    }
    

    
  } catch (error) {

    console.log("can't update task due to this",error);

    if(error.data && error.response.data){

      
    }
    
    
  }finally{
    setLoading(false)
  }
}

// Attachment handlers (dummy for now)

const getFileIconComponent = (type) => {
  if (type.includes('pdf')) return <FileText className="w-6 h-6 text-white" />;
  if (type.includes('doc')) return <FileText className="w-6 h-6 text-white" />;
  if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="w-6 h-6 text-white" />;
  if (type.includes('image')) return <Image className="w-6 h-6 text-white" />;
  if (type.includes('zip') || type.includes('rar')) return <Archive className="w-6 h-6 text-white" />;
  return <File className="w-6 h-6 text-white" />;
};

// Utility: Get file icon background
const getFileIconBackground = (type) => {
  if (type.includes('pdf')) return 'bg-gradient-to-br from-red-500 to-red-600';
  if (type.includes('doc')) return 'bg-gradient-to-br from-blue-500 to-blue-600';
  if (type.includes('sheet') || type.includes('excel')) return 'bg-gradient-to-br from-green-500 to-green-600';
  if (type.includes('image')) return 'bg-gradient-to-br from-purple-500 to-purple-600';
  if (type.includes('zip') || type.includes('rar')) return 'bg-gradient-to-br from-yellow-500 to-yellow-600';
  return 'bg-gradient-to-br from-gray-500 to-gray-600';
};

// Utility: Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Download handler for task attachments
const handleDownload = async (attachment) => {
  try {
    if (attachment.type.includes('image')) {
      window.open(attachment.url, '_blank');
    } else {
      const downloadUrl = `http://localhost:3000/task/api/download/${attachment.cloudinaryId}/${encodeURIComponent(attachment.filename)}`;
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


const fetchAvailableComment = async ()=>{
  try {

    const availableComment = await axios.get(`http://localhost:3000/task/api/getTaskComment/${selectedTask._id}`,{withCredentials:true})

    setTaskComments(availableComment.data.comments)
    
  } catch (error) {
    console.log("can't load comments due to this",error);
    
    
  }
}
const postComment = async () => {
  
  setCommentLoading(true)

  try {

    await axios.post(`http://localhost:3000/task/api/createTaskComment/${selectedTask._id}`,{content:commentContent},{withCredentials:true})
    fetchAvailableComment()
    setCommentContent('')


    
  } catch (error) {

    console.log("can't create this comment due to this",error);
    
    
  }finally{

    setCommentLoading(false)
  }
};



       const handleEditTask = (task)=>{

        setShowTaskModal(true)
        setSelectedTask(task)

   }
    
  
  
     
  


   // drag and drop functionality
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [taskDeleted,setTaskDeleted]=useState(null)
  const [showManageManagerModal,setShowManageManagerModal]=useState('')
    const [sure,setSure]=useState(false)


 

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'task',
      id: task._id,
      sourceColumnId: columnId,
      index: index
    }));
    onDragStart && onDragStart(task);
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    onDragEnd && onDragEnd();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTaskDelete = (task)=>{

    setSure(true)
    setTaskDeleted(task)
  }

 const priorityBadgeMap = {
  Low:   'bg-blue-50 text-blue-700 border border-blue-200',
  Medium:'bg-blue-100 text-blue-800 border border-blue-300',
  High:  'bg-yellow-100 text-yellow-800 border border-yellow-300',
  Urgent:'bg-red-100 text-red-700 border border-red-300',
};;
 

 
    
  return (
    <div
      draggable={!showTaskModal} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
        className={` rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 group mb-3 select-none
      ${isDragging ? 'opacity-70 transform rotate-1 scale-105' : ''}
      ${isDeleting ? 'opacity-50' : ''}
      ${showTaskModal ? 'cursor-default' : 'cursor-grab'}
    `}>
 
    {/* Card content */}
    <div className="flex flex-row items-center justify-between mb-4 mt-2">
      <h4 className="text-gray-600 font-semibold text-sm leading-5 mb-1 break-words max-w-52 truncate">
        {task.name}
      </h4>
      <div className="flex items-center gap-1 ">

          <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityBadgeMap[selectedTask?.priority || task?.priority || 'Medium']}`}
          title={`Priority: ${selectedTask?.priority || task?.priority || 'Medium'}`}
        >
          {selectedTask?.priority || task?.priority || 'Medium'}
        </span>
        <button
          onClick={() => { handleEditTask(task) }}
          className={` text-gray-400 hover:text-blue-500 transition-all ml-2 cursor-pointer  duration-200 p-1 flex-shrink-0 ${isDeleting ? 'cursor-not-allowed' : ''}`}
        >
          <Eye size={16} />
        </button>
      
      </div>
    </div>

    {/* Labels under title */}
    {Array.isArray(task.label) && task.label.length > 0 && (
      <div className="flex gap-1 flex-wrap mb-1">
        {task.label.map((label, idx) => {
          const colorDef = [
            { color: "#2563eb", effect: "dot" },
            { color: "#22c55e", effect: "vertical" },
            { color: "#ef4444", effect: "horizontal" },
            { color: "#eab308", effect: "diagonal" },
            { color: "#a21caf", effect: "dot" },
            { color: "#ec4899", effect: "dot" },
            { color: "#0ea5e9", effect: "dot" },
            { color: "#f59e42", effect: "dot" },
            { color: "#64748b", effect: "dot" },
            { color: "#14b8a6", effect: "dot" },
          ].find(c => c.color === label.color) || { effect: "dot" };
          return (
            <span
              key={idx}
              className="relative inline-flex items-center px-2 py-1.5 rounded-md text-[11px] font-semibold"
              style={{
                background: label.color,
                color: "#fff",
                minWidth: 0,
                position: "relative",
                lineHeight: "1.1",
              }}
            >
              {colorDef.effect === "vertical" && (
                <span className="flex gap-0.5 mr-1">
                  <span className="w-0.5 h-3 bg-white/80 rounded block"></span>
                  <span className="w-0.5 h-3 bg-white/80 rounded block"></span>
                </span>
              )}
              {colorDef.effect === "horizontal" && (
                <span className="flex flex-col gap-0.5 mr-1">
                  <span className="h-0.5 w-3 bg-white/80 rounded block"></span>
                  <span className="h-0.5 w-3 bg-white/80 rounded block"></span>
                </span>
              )}
              {colorDef.effect === "diagonal" && (
                <svg width="10" height="8" className="mr-1" style={{ opacity: 0.7 }}>
                  <line x1="0" y1="8" x2="10" y2="0" stroke="white" strokeWidth="1" />
                </svg>
              )}
              {colorDef.effect === "dot" && (
                <span className="flex gap-0.5 mr-1">
                  <span className="w-1 h-1 bg-white/80 rounded-full block"></span>
                  <span className="w-1 h-1 bg-white/80 rounded-full block"></span>
                </span>
              )}
              {label.name}
            </span>
          );
        })}
      </div>
    )}

    {/* Divider Footer Line */}
    <div className="w-full border-b border-gray-200 my-2"></div>

    {/* Top row: Due Date, Comments, Attachments (left) | Members (right) */}
    <div className="flex items-center justify-between text-xs text-gray-500 mt-1 gap-3">
      {/* Left side: Due Date, Comments, Attachments */}
      <div className="flex items-center gap-3">
        {/* Due Date */}
{task.due && (
  <div className="flex items-center gap-1">
    <Calendar
      size={12}
      className={
        task.status === 'Done'
          ? "text-gray-400"
          : (dayjs(task.due).isSame(dayjs(), 'day') || dayjs(task.due).isBefore(dayjs(), 'day'))
            ? "text-red-500 animate-pulse"
            : "text-blue-500"
      }
    />
    <span
      className={
        task.status === 'Done'
          ? "text-gray-400 font-normal"
          : (dayjs(task.due).isSame(dayjs(), 'day') || dayjs(task.due).isBefore(dayjs(), 'day'))
            ? "text-red-600 font-bold"
            : "text-gray-700"
      }
    >
      {dayjs(task.due).format('MMM D')}
    </span>
  </div>
)}
        {/* Comments */}
        {Array.isArray(task.comment) && (
          <div className="flex items-center gap-1">
            <MessageSquare size={12} className="text-blue-500" />
            <span>{taskComments.length}</span>
          </div>
        )}
        {Array.isArray(subTasksFetched) && subTasksFetched.length > 0 && (
          <div className="flex items-center gap-1">
            <CheckSquare size={12} className="text-blue-500" />
            <span>{subTasksFetched.filter(p => p.isChecked).length}/{subTasksFetched.length}</span>
          </div>
        )}
        {/* Attachments */}
        {Array.isArray(task.attachments) && (
          <div className="flex items-center gap-1">
            <Paperclip size={12} className="text-gray-500" />
            <span>{task.attachments.length}</span>
          </div>
        )}
      </div>
      {/* Right side: Members */}
      <div className="flex -space-x-1 flex-shrink-0 ml-2">
        {Array.isArray(task.assignedTo) && task.assignedTo.slice(0, 2).map((member, idx) => (
          <div key={member._id || idx} className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium overflow-hidden">
            {member.avatar ? (
              <img src={member.avatar} alt={member.firstName} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              (member.firstName?.[0] || '') + (member.lastName?.[0] || '')
            )}
          </div>
        ))}
        {Array.isArray(task.assignedTo) && task.assignedTo.length > 2 && (
          <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-xs font-medium">
            +{task.assignedTo.length - 2}
          </div>
        )}
      </div>
    </div>

     
      {showTaskModal && selectedTask && (
<div className="fixed inset-0 z-150 flex items-center justify-center p-4 md:p-0 bg-black/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl md:w-[900px] rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col task-modal-animate">
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
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1d4ed8;
        }
            @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fade-in 0.18s cubic-bezier(.4,0,.2,1);
        }
           @keyframes modalPopIn {
    from { transform: scale(0.96); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .task-modal-animate {
    animation: modalPopIn 0.22s cubic-bezier(.4,2,.3,1) both;
  }
      `}</style>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-500">Task Detail</p>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-blue-600 hover:bg-gray-50/80 hover:backdrop-blur-sm rounded-full p-1.5 transition-all duration-300 hover:shadow-lg hover:scale-105"
                    onClick={() => {handleClose()}}>
                    <CircleX className="w-6 h-6" />
                  </button>
                </div>
              </div>
              {/* Task Name and Logo Section */}
              <div className="flex items-start space-x-4 mb-4">
              <div className="flex-grow">
                 
              
                    <h2 className="text-2xl font-semibold text-gray-900   transition-colors">
                      
                      {editedTaskTitle}
                    </h2>
                
                  
                    <div className="mt-2">
                      <p className="text-sm text-gray-600  transition-colors min-h-[20px]"
                        title="Click to edit">
                        {editedTaskDescription || "No description..."}
                      </p>
                    </div>
                  <div className="mt-5">
                    <FormControl sx={{ minWidth: 180 }}>
                      <InputLabel id="task-status-select-label">Priority</InputLabel>
                      <Select
                        labelId="task-status-select-label"
                        id="task-status-select"
                        label="Priority"
                        value={taskPriority}
                        readOnly
                  
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              borderRadius: 3,
                              boxShadow: 3,
                            },
                          },
                        }}
                      >
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Urgent">Urgent</MenuItem>
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
                  {/* Task Info */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Assigned to</p>
                        <div className="flex -space-x-2">
                          {taskMembers?.slice(0, 3).map((member, i) => (
                            <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white">
                              {member.avatar ? (
                                <img src={member.avatar} alt={member.firstName} className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="text-white font-normal text-xs">
                                  {member.firstName?.[0]}{member.lastName?.[0]}
                                </div>
                              )}
                            </div>
                          ))}
                          {taskMembers?.length > 3 && (
                            <div className="h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                              +{taskMembers.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Assigned to Teams</p>
                        <div className="flex -space-x-2">
                          {taskTeams?.slice(0, 3).map(team => (
                            <div key={team._id} className={`h-8 w-8 rounded-full ring-2 ring-white flex items-center justify-center text-xs font-medium text-white ${getTeamColor(team.name)}`}>
                            
                                <span className="text-white font-bold">{getTeamInitials(team.name)}</span>
                            </div>
                          ))}
                          {taskTeams?.length > 3 && (
                            <div className="h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                              +{taskTeams.length - 3}
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
                            readOnly
                            value={taskDueDate ? dayjs(taskDueDate) : null}
                            onChange={newValue => { setTaskDueDate(newValue ? newValue.toISOString() : null) , setTaskChange(true)}}
                            slotProps={{
                              popper: {
                                placement: 'bottom-start',
                                sx: { zIndex: 9999 }
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </div>
                      <div>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="Created Date"
                            value={dayjs(selectedTask.createdAt)}
                            readOnly
                            disableOpenPicker
                            slotProps={{
                              popper: { sx: { zIndex: 9999 } }
                            }}
                          />
                        </LocalizationProvider>
                      </div>
                    </div>
                    
                  </div>
                  {/* Tabs (Tasks, Attachments, Comments) */}
                  <div className="border-b border-gray-200 mt-6">
                    <nav className="flex gap-4 -mb-px">
                      <button
                        onClick={() => setActiveTab('tasks')}
                        className={`py-3 px-1 text-sm font-medium border-b-2 ${activeTab === 'tasks' ? 'text-blue-600 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'}`}
                      >
                        SubTasks
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
                  <div key={activeTab} className="min-h-fit overflow-y-auto custom-scrollbar pr-4 w-full animate-fade-in">
                    
      {activeTab === 'tasks' && (
  <div className="w-full space-y-4">
   

    {subTasksFetched.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 min-h-[180px]">
    <CheckSquare className="w-14 h-14 text-gray-400 mb-2" />
    <h4 className="text-lg font-semibold text-gray-500 mb-1 text-center">
      No subtasks yet
    </h4>
  </div>
            ) : (
              <ul className="space-y-3  ">
                {subTasksFetched.map((sub, idx) => (
                  <li
                    key={idx}
                    className={`group p-4 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:bg-blue-50/30 transition-all duration-200 flex items-center justify-between shadow-sm relative ${
                      sub.isChecked ? 'opacity-60 line-through' : ''
                    }`}
                  >
                   
                    <div className="flex items-center gap-3">
        
                      <button
                        onClick={() => handleCheckSubTask(idx)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200
                          ${sub.isChecked
                            ? 'bg-green-100 border-green-400 scale-110 shadow-lg'
                            : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        aria-label={sub.isChecked ? 'Uncheck subtask' : 'Check subtask'}
                      >
                        {sub.isChecked ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 animate-bounce" />
                        ) : (
                          <CircleX className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        )}
                      </button>
                      <span className={`font-medium text-gray-800 text-base transition-all duration-200 ${sub.isChecked ? 'line-through' : ''}`}>
                        {sub.item}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mr-6">
                      {sub.isChecked && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 animate-fade-in">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Done
                        </span>
                      )}
                      {!sub.isChecked && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 animate-fade-in">
                          <Clock className="w-4 h-4 mr-1" /> Pending
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
  </div>
)}
                    {activeTab === 'attachments' && (
                      <div className="space-y-3 mr-2">
                       
                        {!taskAttachments || taskAttachments.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No attachments yet</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-700">
                                Task Files ({taskAttachments.length}/5)
                              </h4>
                          
                            </div>
                {taskAttachments.map((attachment, index) => (
  <div key={index} className={`p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/30 transition-all duration-200 w-full group`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-grow">
        <div className={`w-12 h-12 rounded-xl ${getFileIconBackground(attachment.type)} flex items-center justify-center shadow-sm`}>
          {getFileIconComponent(attachment.type)}
        </div>
        <div className="flex-grow">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">{attachment.filename}</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {formatFileSize(attachment.size)}
            </span>
            <span className="text-xs text-gray-400">
              Uploaded {attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
        {/* Eye icon for image preview */}
        {attachment.type.includes('image') && (
          <button
            onClick={() => window.open(attachment.url, '_blank')}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Preview image"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        {/* Download icon for all files */}
        <button
          onClick={() => handleDownload(attachment)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          title="Download attachment"
        >
          <Download className="w-4 h-4" />
        </button>

      </div>
    </div>
  </div>
))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 text-center">
                          {taskAttachments?.length || 0}/5 attachments used
                        </p>
                      </div>
                    )}
                    {activeTab === 'comments' && (
                      <div className="space-y-4 mr-2 mt-2">
                        <div className="flex items-start space-x-4 group">
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
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group-hover:border-blue-200">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                              <div className="relative p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="text-sm font-semibold text-gray-900">
                                      {userData.firstName} {userData.lastName}
                                    </h4>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      You
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-full">
                                    Now
                                  </span>
                                </div>
                                <div className="mb-3">
                                  <textarea
                                    className="w-full p-3 text-sm border-0 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none placeholder-gray-400 transition-all duration-200"
                                    placeholder="Share your thoughts..."
                                    rows="3"
                                    maxLength={500}
                                    value={commentContent || ''}
                                    onChange={e => setCommentContent(e.target.value)}
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center shadow-sm ${
                                      commentContent && commentContent.trim()
                                        ? 'text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-purple-700 hover:shadow-md transform hover:scale-105'
                                        : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                    }`}
                                    onClick={postComment}
                                    disabled={commentLoading || !commentContent || !commentContent.trim()}
                                  >
                                    {commentLoading ? (
                                      <>
                                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Posting...
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        Post Comment
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="absolute left-0 top-6 transform -translate-x-1 w-3 h-3">
                                <div className="w-3 h-3 bg-white border-l border-b border-gray-100 transform rotate-45 shadow-sm"></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 ml-4">
                              <div className="flex items-center space-x-3 text-xs text-gray-400">
                                <span className="flex items-center space-x-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  <span>Ready to post</span>
                                </span>
                              </div>
                              <div className="text-xs text-gray-400">
                                {commentContent ? `${commentContent.length}/500` : '0/500'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {taskComments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <MessageSquare className="w-6 h-6 text-gray-300" />
                              </div>
                              <p>No comments yet</p>
                              <p className="text-sm">Start the conversation</p>
                            </div>
                          ) : (
                            taskComments.map((comment, idx) => (
                              <div key={idx} className="flex items-start space-x-4 group">
                                <div className="relative flex-shrink-0">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-lg">
                                    <div className="w-full h-full rounded-full bg-white p-0.5">
                                      {comment.createdBy?.avatar ? (
                                        <img
                                          alt={comment.createdBy.firstName}
                                          className="w-full h-full rounded-full object-cover ring-2 ring-white shadow-sm"
                                          src={comment.createdBy.avatar}
                                        />
                                      ) : (
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                          <span className="text-white font-semibold text-sm">
                                            {comment.createdBy?.firstName?.[0]}{comment.createdBy?.lastName?.[0]}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-grow min-w-0">
                                  <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group-hover:border-blue-200">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                    <div className="relative p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                                            {comment.createdBy?.firstName} {comment.createdBy?.lastName}
                                          </h4>
                                        
                                        </div>
                                        <time className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-full">
                                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'N/A'}
                                        </time>
                                      </div>
                                      <div className="prose prose-sm max-w-none">
                                        <p className="text-sm text-gray-700 leading-relaxed mb-0 whitespace-pre-wrap">
                                          {comment.content}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="absolute left-0 top-6 transform -translate-x-1 w-3 h-3">
                                      <div className="w-3 h-3 bg-white border-l border-b border-gray-100 transform rotate-45 shadow-sm"></div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between mt-2 ml-4">
                                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                                      <span className="flex items-center space-x-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        <span>Posted {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'N/A'}</span>
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
                        <div className="relative">
                          <div className="mb-4">
  <p className="text-sm font-medium text-gray-700 mb-2">Labels</p>
  <div className="flex flex-wrap gap-2 mb-2">
     {taskLabels.map((label, idx) => {
    // Find effect for this color
    const colorDef = [
      { color: "#2563eb", effect: "dot" },
      { color: "#22c55e", effect: "vertical" },
      { color: "#ef4444", effect: "horizontal" },
      { color: "#eab308", effect: "diagonal" },
      { color: "#a21caf", effect: "dot" },
      { color: "#ec4899", effect: "dot" },
      { color: "#0ea5e9", effect: "dot" },
      { color: "#f59e42", effect: "dot" },
      { color: "#64748b", effect: "dot" },
      { color: "#14b8a6", effect: "dot" },
    ].find(c => c.color === label.color) || { effect: "dot" };

    return (
      <span
        key={idx}
        className="relative inline-flex items-center px-3 py-1 rounded-md text-xs font-bold"
        style={{
          background: label.color,
          color: "#fff",
          minWidth: 0,
          position: "relative",
        }}
      >
        {/* Remove label button */}
        <button
          type="button"
          onClick={() => {
            setTaskLabels(prev => {
              const updated = prev.filter((_, i) => i !== idx);
              setTaskChange(true)
              // Optionally: send updated to backend here
              return updated;
            });
          }}
          className="absolute -top-1 -right-1 bg-white/80 hover:bg-white text-gray-500 hover:text-red-600 rounded-full p-0.5 shadow transition-all"
          style={{ lineHeight: 0, zIndex: 2 }}
          title="Remove label"
        >
          <CircleX className="w-3 h-3" />
        </button>
        {/* Effect icon */}
        {colorDef.effect === "vertical" && (
          <span className="flex gap-1 mr-1">
            <span className="w-1 h-4 bg-white/80 rounded block"></span>
            <span className="w-1 h-4 bg-white/80 rounded block"></span>
          </span>
        )}
        {colorDef.effect === "horizontal" && (
          <span className="flex flex-col gap-1 mr-1">
            <span className="h-1 w-5 bg-white/80 rounded block"></span>
            <span className="h-1 w-5 bg-white/80 rounded block"></span>
          </span>
        )}
        {colorDef.effect === "diagonal" && (
          <svg width="16" height="12" className="mr-1" style={{ opacity: 0.7 }}>
            <line x1="0" y1="12" x2="16" y2="0" stroke="white" strokeWidth="2" />
          </svg>
        )}
        {colorDef.effect === "dot" && (
          <span className="flex gap-1 mr-1">
            <span className="w-2 h-2 bg-white/80 rounded-full block"></span>
            <span className="w-2 h-2 bg-white/80 rounded-full block"></span>
          </span>
        )}
        {label.name}
      </span>
    );
  })}
</div>
<button
  onClick={() => setShowLabelModal(true)}
  className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all shadow-sm"
>
  Add Label
</button>
</div>

{showLabelModal && (
  <>
    <div
      className="fixed inset-0 z-[9998]"
      onClick={() => setShowLabelModal(false)}
    ></div>
    <div
      className="absolute left-0 z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-visible animate-fade-in"
      style={{ width: 260, marginTop: -10 }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-normal text-gray-900">Create Label</h3>
          <button
            onClick={() => setShowLabelModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CircleX className="w-5 h-5" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Label name"
          value={newLabelName}
          onChange={e => setNewLabelName(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          maxLength={20}
        />
        <div className="mb-2">
          <p className="text-xs font-semibold text-gray-600 mb-2">Pick a color</p>
          <div className="flex w-full gap-2 mb-2">
            {[
              { color: "#2563eb", name: "blue", effect: "dot" },
              { color: "#22c55e", name: "green", effect: "vertical" },
              { color: "#ef4444", name: "red", effect: "horizontal" },
              { color: "#eab308", name: "yellow", effect: "diagonal" },
              { color: "#a21caf", name: "purple", effect: "dot" },
              { color: "#ec4899", name: "pink", effect: "dot" },
              { color: "#0ea5e9", name: "sky", effect: "dot" },
              { color: "#f59e42", name: "orange", effect: "dot" },
              { color: "#64748b", name: "slate", effect: "dot" },
              { color: "#14b8a6", name: "teal", effect: "dot" },
            ].map(({ color, name, effect }) => (
              <button
                key={color}
                type="button"
                className={`flex-1 h-7 rounded-md border-2 flex items-center justify-center transition-all duration-150 shadow-sm relative
                  ${newLabelColor === color ? 'border-blue-700 scale-105 ring-2 ring-blue-300' : 'border-gray-200'}
                `}
                style={{
                  background: color,
                  minWidth: 0,
                }}
                onClick={() => setNewLabelColor(color)}
              >
                {/* Effect icon */}
                {effect === "vertical" && (
                  <div className="flex gap-1">
                    <div className="w-1 h-5 bg-white/80 rounded"></div>
                    <div className="w-1 h-5 bg-white/80 rounded"></div>
                  </div>
                )}
                {effect === "horizontal" && (
                  <div className="flex flex-col gap-1">
                    <div className="h-1 w-8 bg-white/80 rounded"></div>
                    <div className="h-1 w-8 bg-white/80 rounded"></div>
                  </div>
                )}
                {effect === "diagonal" && (
                  <svg width="24" height="16" className="absolute left-1 top-1" style={{ opacity: 0.7 }}>
                    <line x1="0" y1="16" x2="24" y2="0" stroke="white" strokeWidth="2" />
                  </svg>
                )}
                {effect === "dot" && (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                  </div>
                )}
                {/* Check icon if selected */}
               
              </button>
            ))}
          </div>
        </div>
        
        {/* Preview Trello-style label */}
        {newLabelName.trim() && (
          <div className="mt-3 flex justify-center">
            <span
              className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium"
              style={{
                background: newLabelColor,
                color: "#fff",
                minWidth: 0,
                position: "relative",
              }}
            >
              {/* Effect icon */}
              {(() => {
                const effect = [
                  { color: "#2563eb", effect: "dot" },
                  { color: "#22c55e", effect: "vertical" },
                  { color: "#ef4444", effect: "horizontal" },
                  { color: "#eab308", effect: "diagonal" },
                  { color: "#a21caf", effect: "dot" },
                  { color: "#ec4899", effect: "dot" },
                  { color: "#0ea5e9", effect: "dot" },
                  { color: "#f59e42", effect: "dot" },
                  { color: "#64748b", effect: "dot" },
                  { color: "#14b8a6", effect: "dot" },
                ].find(c => c.color === newLabelColor)?.effect || "dot";
                if (effect === "vertical")
                  return (
                    <span className="flex gap-1 mr-1">
                      <span className="w-1 h-4 bg-white/80 rounded block"></span>
                      <span className="w-1 h-4 bg-white/80 rounded block"></span>
                    </span>
                  );
                if (effect === "horizontal")
                  return (
                    <span className="flex flex-col gap-1 mr-1">
                      <span className="h-1 w-5 bg-white/80 rounded block"></span>
                      <span className="h-1 w-5 bg-white/80 rounded block"></span>
                    </span>
                  );
                if (effect === "diagonal")
                  return (
                    <svg width="16" height="12" className="mr-1" style={{ opacity: 0.7 }}>
                      <line x1="0" y1="12" x2="16" y2="0" stroke="white" strokeWidth="2" />
                    </svg>
                  );
                // dot
                return (
                  <span className="flex gap-1 mr-1">
                    <span className="w-2 h-2 bg-white/80 rounded-full block"></span>
                    <span className="w-2 h-2 bg-white/80 rounded-full block"></span>
                  </span>
                );
              })()}
              {newLabelName}
            </span>
          </div>
        )}
        <button
          onClick={() => {
            if (newLabelName.trim()) {
              setTaskLabels(prev => [
                ...prev,
                { name: newLabelName.trim(), color: newLabelColor }
              ]);
              setNewLabelName('');
              setNewLabelColor('#2563eb');
              setTaskChange(true)

            }
          }}
          className="block  mt-4 mb-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-all disabled:opacity-50"
          disabled={!newLabelName.trim()}
        >
          Add Label
        </button>
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
      <span className="font-medium text-gray-800">{taskMembers.length}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Teams:</span>
      <span className="font-medium text-gray-800">{taskTeams.length}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Status:</span>
      <span className="font-medium text-gray-800">{selectedTask.status || 'Not set'}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Priority:</span>
      <span className="font-medium text-gray-800">{selectedTask.priority || 'Not set'}</span>
    </div>
    
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Attachments:</span>
      <span className="font-medium text-gray-800">{taskAttachments?.length || 0}</span>
    </div>
  </div>
</div>
                        
                      </div>
                    </div>

{selectedMembers.length > 0 && (
  <div      key={selectedMembers.map(m => m._id).join(',')}
 className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 mb-6 animate-fade-in">
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
<div      key={selectedTeams.map(m => m._id).join(',')}
 className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 mb-6 animate-fade-in">
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center">
     
      <h3 className="text-sm font-normal text-gray-700">Selected Teams</h3>
    </div>
    <div className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200">
      {selectedTeams.length} 
    </div>
  </div>
  
  <div className="space-y-3">
      {selectedTeams.map((team) => (
        <div key={team._id} className="group p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all duration-150">
          <div className="flex items-center space-x-1.5">
            <div className="relative flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white bg-gradient-to-br from-blue-600 to-blue-700`}>
             
                  <div className="text-white font-bold text-md">
                    {getTeamInitials(team.name)}
                  </div>
            
              </div>
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {team.name}
              </p>
              <p className="text-xs font-normal text-gray-600 truncate">
                {team.description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Optionally add actions for teams here */}
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
                <img alt="Creator avatar" className="h-8 w-8 rounded-full mr-2" src={selectedTask.CreatedBy?.avatar} />
                <p className="text-sm text-gray-600">Created by <span className="font-medium">{selectedTask.CreatedBy?.firstName+' '+selectedTask.CreatedBy?.lastName}</span></p>
              </div>
              <div className="flex space-x-2">
        
       <button 
    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center transition-colors" 
    onClick={handleUpdate}

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
      {sure && taskDeleted && (
        <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div 
            className="fixed inset-0" 
            onClick={() => {
              setShowDeleteConfirmModal(false);
              setProjectToDelete(null);
            }}
          ></div>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative z-10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Task?</h3>
              </div>
            </div>
            
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete <span className="font-semibold">"{task.name}"</span>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. All comments, attachments will be permanently removed.
            </p>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setSure(false);
                  setTaskDeleted(null);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                No, Cancel
              </button>
              <button 
                onClick={() => deleteTask(taskDeleted)}
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
      {warningModal && (
        <div className="fixed inset-0 z-[10004] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div 
            className="fixed inset-0" 
            onClick={() => setWarningModal(false)}
          ></div>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative z-10 border border-gray-200">
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
                onClick={()=>{discardChanges()}}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Discard Changes
              </button>
              <button 
                onClick={()=>{handleUpdate()

                }}
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
                onClick={() => setWarningModal(false)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskCardWorker;