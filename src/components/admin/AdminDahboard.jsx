import React, { useContext, useState, useEffect } from "react";

import {
  LayoutDashboard,
  MessageSquare,
  CheckCircle,
  ClipboardList,
  Users2,
  Briefcase,
  ListTodo,
  Calendar as CalendarIcon,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  FolderX,
  X,
  UserPlus,
  Sparkles,
  Target,
  Star,
  RefreshCw,
  Trash2,
  Edit,
  Clock,
  FileMinus,
  MessageCircle,
  ListChecks,
  ArrowLeftRight
} from "lucide-react";

import socket from '../../utils/socket';
import UseFetch from "../../hooks/UseFetch";
import { checkfetchedData } from "../../context/Authcontext";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";

import '../../App.css'




const RecentProjectsCard = ({ title, className , recentProject }) => {
  const navigate = useNavigate()
 return <div className={`group relative flex flex-col p-5 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 rounded-3xl shadow-lg border border-gray-200/50 backdrop-blur-sm hover:shadow-lg transition-all duration-500 ${className}`}>
      {/* Premium background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3 rounded-3xl"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 ml-4 tracking-tight">{title}</h2>
          </div>
          <button 
            onClick={() => navigate('/workspace/projects')} 
            className="group/btn text-blue-600 text-sm font-semibold flex items-center bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            See All 
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-1 flex-1">
          { recentProject.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FolderX className="w-14 h-14 text-gray-300 mb-4" />
              <span className="text-gray-500 text-lg font-medium">No projects found</span>
            </div>
          ) : (
          recentProject.map(project => {
            const progressProject = project.tasks && project.tasks.length > 0
              ? (project.tasks.filter(t => t.status === 'done').length / project.tasks.length) * 100
              : 0;
            
            return (
              <div key={project._id} className="group/project relative bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-md border border-gray-100/80 hover:shadow-lg hover:bg-white transition-all duration-300 animate-fadein-pop">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/5 rounded-2xl opacity-0 group-hover/project:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 text-sm tracking-tight">{project.name}</h4>
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
                      project.status === "Completed" ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800" :
                      project.status === "In Progress" ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800" :
                      "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out shadow-sm" 
                      style={{ width: `${progressProject}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      <span className="font-medium">Due: {project.dueDate ? new Date(project.dueDate).toISOString().slice(0, 10) : "N/A"}</span>
                    </div>
                    <span className={`flex items-center px-3 py-1.5 rounded-xl font-bold shadow-sm ${
                      progressProject >= 75 ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' : 
                      'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                    }`}>
                      {progressProject >= 75 ? 
                        <TrendingUp className="w-3.5 h-3.5 mr-1" /> : 
                        <TrendingDown className="w-3.5 h-3.5 mr-1" />
                      }
                      {Math.round(progressProject)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          }) ) }
        </div>
      </div>
    </div>
};

const TaskCompletedChartCard = ({ className , dueTodayTasks ,allTasks}) => {

  
    const doneTask = allTasks.filter(t => t.status==='done')
  const percent = allTasks.length === 0 ? 0 : Math.round((doneTask.length / allTasks.length) * 100);
  return (
    <div className={`group relative flex flex-col bg-gradient-to-br from-white via-gray-50/30 to-green-50/20 rounded-3xl shadow-lg border border-gray-200/50 backdrop-blur-sm hover:shadow-lg transition-all duration-500 ${className} justify-center items-center overflow-hidden`}>
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 via-transparent to-blue-500/3 rounded-3xl"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-400/10 to-transparent rounded-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/5 to-transparent rounded-3xl"></div>
      
      <div className="relative z-10 w-full">
        <div className="w-full flex items-center justify-between px-8 pt-4 pb-4">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 ml-4 tracking-tight">Tasks Completed</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-sm font-bold shadow-sm">
              {doneTask.length}/{allTasks.length}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-1 w-full px-8 pb-8">
          <div className="w-full relative mb-6">
            <div className="w-full h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center relative overflow-hidden shadow-inner">
              <div 
                className="h-12 rounded-2xl bg-gradient-to-r from-green-500 via-green-600 to-green-500 shadow-lg transition-all duration-1000 ease-out relative overflow-hidden" 
                style={{ width: `${percent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
              </div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <span className="text-sm font-bold px-4 py-2 rounded-xl bg-white/95 text-gray-800 shadow-lg backdrop-blur-sm border border-white/50">
                  {percent}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">Overall Progress</span>
            </div>
        
          </div>
        </div>
      </div>
    </div>
  );
};

const CalendarCard = ({ className , calendar ,getStatusColor }) => {
  const navigate = useNavigate()
   const eventCards = [];
  calendar.forEach(event => {
    if (event.tasks && event.tasks.length > 0) {
      event.tasks.forEach(task => {
        eventCards.push({
          key: `${event._id}-${task._id}`,
          name: event.name,
          taskName: task.name,
          status: task.status,
          dueDate: event.dueDate,
        });
      });
    } else {
      eventCards.push({
        key: event._id,
        name: event.name,
        taskName: null,
        status: event.status,
        dueDate: event.dueDate,
      });
    }
  });
  const limitedCards = eventCards.slice(0, 2);

  return (
    <div className={`group relative flex flex-col bg-gradient-to-br from-white via-gray-50/30 to-purple-50/20 rounded-3xl shadow-lg border border-gray-200/50 backdrop-blur-sm hover:shadow-lg transition-all duration-500 ${className} justify-center items-center overflow-hidden`}>
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-transparent to-blue-500/3 rounded-3xl"></div>
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-3xl"></div>
      
      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="w-full flex items-center justify-between px-6 pt-4 pb-4">
          <div className="flex items-center">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 ml-4 tracking-tight">Calendar</h2>
          </div>
          <button 
            onClick={() => navigate('/workspace/calendar')} 
            className="group/btn text-purple-600 text-sm font-semibold flex items-center bg-gradient-to-r from-purple-50 to-purple-100 px-3 py-1.5 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            See All 
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-start flex-1 w-full px-8 pb-4 overflow-hidden">
          {limitedCards.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <div className="p-4 bg-gray-100 rounded-2xl">
                <CalendarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Calendar events will appear here.</span>
            </div>
          )}
          <div className="w-full space-y-1"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <style>
              {`
                .calendar-scroll::-webkit-scrollbar {
                  display: none;
                  background: transparent;
                }
                @keyframes fadein-pop {
                  0% { opacity: 0; transform: scale(0.95) translateY(24px);}
                  100% { opacity: 1; transform: scale(1) translateY(0);}
                }
                .animate-fadein-pop {
                  animation: fadein-pop 0.6s cubic-bezier(.4,0,.2,1) forwards;
                }
              `}
            </style>
            {limitedCards.map((card, idx) => (
              <div
                key={card.key}
                className="group/event bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100/80 hover:shadow-lg transition-all duration-300 overflow-hidden opacity-0 animate-fadein-pop"
                style={{ animationDelay: `${idx * 0.12}s` }}
              >
                <div className="flex items-center w-full px-4 py-2.5  hover:bg-gray-50/50 transition-colors duration-200 ">
                  <span className={`inline-block w-4 h-4 rounded-full mr-4 shadow-sm ${getStatusColor(card.status)}`}></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-gray-900 text-sm truncate">{card.name}</span>
                      {card.taskName && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600 text-sm truncate">{card.taskName}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-3 py-1 rounded-lg font-semibold ${
                        card.status === 'done' ? 'bg-green-100 text-green-700' :
                        card.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {card.status}
                      </span>
                      <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-lg">
                        {card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 10) : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const RecentActivityFeed = ({ title, className, recentNotifications }) => (
 <div className={`group relative flex flex-col px-6 py-4 bg-gradient-to-br from-white via-gray-50/30 to-indigo-50/20 rounded-3xl shadow-lg border border-gray-200/50 backdrop-blur-sm hover:shadow-lg transition-all duration-500 ${className} `}>
    {/* Premium background effects */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/3 via-transparent to-purple-500/3 rounded-3xl"></div>
    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-400/10 to-transparent rounded-3xl"></div>
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
            <ListTodo className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 ml-4 tracking-tight">{title}</h2>
        </div>
      </div>
      
      <div className="flex-1 space-y-1.5">
        {recentNotifications.map(activity => (
          <div key={activity.id} className="group/activity flex items-start bg-white/80 backdrop-blur-sm h-[85px] rounded-2xl shadow-md border border-gray-100/80 p-3 hover:shadow-lg hover:bg-white transition-all duration-300 animate-fadein-pop">
            <div className="flex flex-col items-center justify-center h-full">
              <div className={`flex-shrink-0 p-3 rounded-2xl mr-4 text-white shadow-lg ${activity.bg}`}>
                {activity.icon}
              </div>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-[12px] text-gray-900 font-semibold leading-relaxed mb-0.5 pr-2">{activity.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-lg">{activity.createdAt}</span>
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full opacity-60 group-hover/activity:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        ))}
        
        {recentNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="p-4 bg-gray-100 rounded-2xl">
              <ListTodo className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-center text-sm text-gray-500 font-medium">No notifications yet.</div>
          </div>
        )}
      </div>
    </div>
  </div>
);

function StatBubbleCard({ icon, value, title, trend, trendValue }) {
   return (
    <div className="group relative rounded-3xl shadow-lg h-[130px] flex flex-col justify-between px-6 py-5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden hover:shadow-3xl transition-all duration-500 ">
      {/* Premium geometric patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white to-transparent rounded-full transform translate-x-8 -translate-y-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white to-transparent rounded-full transform -translate-x-6 translate-y-6"></div>
      </div>
      
      {/* Animated premium corner effect */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-bl from-white via-blue-200 to-transparent rounded-3xl animate-pulse"></div>
        <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-6 right-8 w-2 h-2 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-4 right-16 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      {/* Flowing lines effect */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 140">
        <path d="M0,70 Q50,20 100,70 T200,70" stroke="white" strokeWidth="1" fill="none" className="animate-pulse" />
        <path d="M0,90 Q60,40 120,90 T240,90" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" fill="none" style={{ animationDelay: '0.5s' }} className="animate-pulse" />
      </svg>
      
      {/* Main content */}
      <div className="relative  flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 flex items-center justify-center shadow-lg border border-white/10 group-hover:bg-white/30 transition-all duration-300">
            <div className="text-white">
              {icon}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">{value}</span>
            </div>
            <div className="text-sm font-medium text-blue-100 tracking-wide mt-1">{title}</div>
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="relative z-10 w-full">
        <div className="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"></div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl"></div>
    </div>
  );
}

function AdminDahboard() {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [showAllCalendar, setShowAllCalendar] = useState(false);
  const [proejctInfos,setProjectInfos]=useState([])
  const [recentProject,setRecentProject]=useState([])
  const [recentNotifications,setRecentNotifications]=useState([])
  const [calendar,setCalendar]=useState([])
  const [teams,setTeams]=useState([])


  const userData = UseFetch();

  function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 1) return `${diffDay} days ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffHour >= 1) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffMin >= 1) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  return "Just now";
}

  
  

  useEffect(() => {
    if (userData.id) {
      socket.emit("online_user", { userId: userData.id });
      socket.emit("join_user_room", userData.id);
    }
  }, [userData.id]);
   useEffect(()=>{

    

    fetchGeneralInfos()
    recentProjects()
    getRecentNotifications()
    fetchGeneralCalrndarInfos()
    fetchAvailableTeams()


  },[userData.id])

  const notifTheme = {
  "Project Assignment": {
     bg: "bg-gradient-to-br from-blue-500 to-blue-700",
     color: "text-blue-700",
     icon: <UserPlus className="w-5 h-5" />
   },
   "Project Update": {
     bg: "bg-gradient-to-br from-yellow-500 to-yellow-700",
     color: "text-yellow-700",
     icon: <RefreshCw className="w-5 h-5" />
   },
   "Project Comment": {
     bg: "bg-gradient-to-br from-green-500 to-green-700",
     color: "text-green-700",
     icon: <MessageSquare className="w-5 h-5" />
   },
   "Project Removed": {
     bg: "bg-gradient-to-br from-red-500 to-red-700",
     color: "text-red-700",
     icon: <Trash2 className="w-5 h-5" />
   },
   "SubTask Assignment": {
     bg: "bg-gradient-to-br from-indigo-500 to-indigo-700",
     color: "text-indigo-700",
     icon: <ClipboardList className="w-5 h-5" />
   },
   "Task Update": {
     bg: "bg-gradient-to-br from-orange-500 to-orange-700",
     color: "text-orange-700",
     icon: <Edit className="w-5 h-5" />
   },
   "Task Removed": {
     bg: "bg-gradient-to-br from-pink-500 to-pink-700",
     color: "text-pink-700",
     icon: <FileMinus className="w-5 h-5" />
   },
   "Task Comment": {
     bg: "bg-gradient-to-br from-teal-500 to-teal-700",
     color: "text-teal-700",
     icon: <MessageCircle className="w-5 h-5" />
   },
   "Subtask Status Changed": {
     bg: "bg-gradient-to-br from-purple-500 to-purple-700",
     color: "text-purple-700",
     icon: <ListChecks className="w-5 h-5" />
   },
   "Task Status Update": { 
     bg: "bg-gradient-to-br from-cyan-500 to-cyan-700",
     color: "text-cyan-700",
     icon: <ArrowLeftRight className="w-5 h-5" />
   },"Team Assignment": {
   bg: "bg-gradient-to-br from-blue-500 to-blue-700",
   color: "text-blue-700",
   icon: <Users2 className="w-5 h-5" />
 },
 "Team Update": {
   bg: "bg-gradient-to-br from-yellow-500 to-yellow-700",
   color: "text-yellow-700",
   icon: <Edit className="w-5 h-5" />
 },
 "Team Deleted": {
   bg: "bg-gradient-to-br from-red-500 to-red-700",
   color: "text-red-700",
   icon: <Trash2 className="w-5 h-5" />
 },
};

function getStatusColor(status) {
  if (!status) return "bg-gray-400";
  const s = status.toLowerCase();
  if (s.includes("done") || s === "completed") return "bg-green-500";
  if (s.includes("progress")) return "bg-blue-500";
  if (s.includes("backlog")) return "bg-yellow-500";
  if (s.includes("ongoing")) return "bg-cyan-500";
  if (s.includes("review")) return "bg-purple-500";
  if (s.includes("blocked") || s.includes("hold")) return "bg-red-500";
  // Generate color from string hash for unknown statuses
  const colors = ["bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-gray-500"];
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash += s.charCodeAt(i);
  return colors[hash % colors.length];
}

const fetchGeneralCalrndarInfos = async ()=>{

      try {

        const res = await axios.get("http://localhost:3000/dashboard/getCalendarNotifications",{withCredentials:true})
        console.log("fetched calendar test ",res.data.projects);
        setCalendar(res.data.projects)
        
        
      } catch (error) {

        console.log("can't fetch gnerl projects infos due to this",error);
        
        
      }
    }

    const fetchAvailableTeams = async ()=>{

      try {

        const res = await axios.get("http://localhost:3000/dashboard/getTeamsInfo",{withCredentials:true})

        setTeams(res.data.teams)
        
      } catch (error) {

        console.log("can't fetch teams due to this",error);
        
        
      }
    }

  const fetchGeneralInfos = async ()=>{

      try {

        const res = await axios.get("http://localhost:3000/dashboard/getInfos",{withCredentials:true})
        console.log("fetched project test ",res.data.projects);
        setProjectInfos(res.data.projects)
        
        
      } catch (error) {

        console.log("can't fetch gnerl projects infos due to this",error);
        
        
      }
    }
    const recentProjects = async ()=>{

      try {

        const res = await axios.get("http://localhost:3000/dashboard/getRecentProject",{withCredentials:true})
        console.log("fetched recent project test ",res.data.projects);
        setRecentProject(res.data.projects)
        
        
      } catch (error) {

        console.log("can't fetch gnerl projects infos due to this",error);
        
        
      }
    }
       const getRecentNotifications = async ()=>{

      try {

        const res = await axios.get("http://localhost:3000/dashboard/getRecentNotifications",{withCredentials:true})
        console.log("fetched recent notifications test ",res.data.notification);
        const mapped = res.data.notification.map(n => {
      const theme = notifTheme[n.name] || {
        bg: "bg-blue-100",
        color: "text-blue-700",
        icon: <ListTodo className="w-5 h-5" />
      };
      return {
        id: n._id,
        content: n.content,
        createdAt: timeAgo(n.createdAt),
        ...theme
      };
    });
    setRecentNotifications(mapped);        
        
      } catch (error) {

        console.log("can't fetch gnerl projects infos due to this",error);
        
        
      }
    }

 

  const doneProject = proejctInfos.filter(p=>p.status === 'Completed')
  const availabeTeams = proejctInfos.flatMap(p=> p.teams || [])
const today = new Date();
const allTasks = proejctInfos.flatMap(p => p.tasks || []);
const dueTodayTasks = allTasks.filter(t => {
  if (!t.due || t.status === "done") return false;
  const dueDate = new Date(t.due);
  // Task is due today or earlier
  return (
    dueDate.getFullYear() === today.getFullYear() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getDate() === today.getDate()
  );
});

  const statCardsData = [
    { icon: <LayoutDashboard className="w-6 h-6 text-white" />, title: "TOTAL PROJECTS", value: proejctInfos.length, trend: "up", trendValue: "+12%" },
    { icon: <ClipboardList className="w-6 h-6 text-white" />, title: "TASKS DUE TODAY", value: Array.isArray(dueTodayTasks) ? dueTodayTasks.length : 0, trend: "down", trendValue: "-1" },
    { icon: <CheckCircle className="w-6 h-6 text-white" />, title: "COMPLETED PROJECTS", value: doneProject.length, trend: "up", trendValue: "+15%" },
    { icon: <Users2 className="w-6 h-6 text-white" />, title: "ACTIVE TEAMS", value: Array.isArray(teams) ? teams.length : 0, trend: "up", trendValue: "+1" },
  ];

 

  





  


  return (
    <div className="h-[580px] w-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Top Section - Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
        {statCardsData.map((card, idx) => (
          <StatBubbleCard
            key={idx}
            icon={card.icon}
            value={card.value}
            title={card.title}
            trend={card.trend}
            trendValue={card.trendValue}
          />
        ))}
      </div>

      {/* Main Content Area - Chart, Projects, Activity (cols-3 for shared width) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden">
        {/* First column: Task Chart + Calendar stacked */}
        <div className="flex flex-col gap-2 h-[430px]">
          <TaskCompletedChartCard dueTodayTasks={dueTodayTasks} allTasks={allTasks} className="h-[200px]" />
          <CalendarCard className="h-[230px]" calendar={calendar} getStatusColor={getStatusColor} />
        </div>

        {/* Recent Projects Card (1/3 width) */}
        <RecentProjectsCard
          title="Recent Projects"
          className="h-[430px]"
          recentProject={recentProject}
        />

        {/* Recent Activity Feed (1/3 width) */}
        <RecentActivityFeed
          title="Recent Activity"
          className="h-[430px]"
          recentNotifications={recentNotifications}
        />
      </div>

      {/* Modals remain fixed/absolute with custom-scrollbar-hide */}
      {showAllMessages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto p-4 relative custom-scrollbar-hide">
            <button onClick={() => setShowAllMessages(false)} className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            <h3 className="text-lg font-semibold mb-2">All Messages</h3>
            <div className="text-gray-600">Full list of messages would go here.</div>
          </div>
        </div>
      )}
      {showAllCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto p-4 relative custom-scrollbar-hide">
            <button onClick={() => setShowAllCalendar(false)} className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            <h3 className="text-lg font-semibold mb-2">All Calendar Events</h3>
            <TaskCompletedChartCard className="" />
          </div>
        </div>
      )}

    </div>
  );
}


export default AdminDahboard;
