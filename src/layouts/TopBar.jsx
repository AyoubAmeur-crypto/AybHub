import React, { useState, useEffect ,useRef, useContext} from 'react';
import { Search, Bell, Users, Sun, Moon ,  UserPlus,Pencil,
  RefreshCw,
  MessageSquare,
  Trash2,
  ClipboardList,
  Edit,
  FileMinus,
  MessageCircle,
  ArrowLeftRight ,
  Settings, LogOut,
  ListChecks} from 'lucide-react';
import '../App.css'
import socket from '../utils/socket'
import axios from 'axios';
import useSound from 'use-sound';
import notificationSound from '../assets/notification.mp3'
import '../App.css'
import { checkfetchedData } from '../context/Authcontext';
import { useNavigate } from 'react-router-dom';

function TopBar({userData}) {
  const [hasNotifications, setHasNotifications] = useState(false);
  const [dark,setDark]=useState(false)
  const [openNotification,setOpenNotification]=useState(false)
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState([]) 
  const [otherNotifications,setOtherNotifications]=useState([])
  const [loading,setLoading]=useState(false)
      const [exactInfo,setExactInfos]=useState('')

  const {logout} = useContext(checkfetchedData)
  const navigate = useNavigate()
  
  const [play] = useSound(notificationSound, { 
    volume: 0.7,
    preload: true,
    html5: true,
    format: ['mp3']
  });

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
  },
    "Team Assignment": {
    bg: "bg-gradient-to-br from-blue-500 to-blue-700",
    color: "text-blue-700",
    icon: <Users className="w-5 h-5" />
  },
  "Team Update": {
    bg: "bg-gradient-to-br from-yellow-500 to-yellow-700",
    color: "text-yellow-700",
    icon: <Pencil className="w-5 h-5" />
  },
  "Team Deleted": {
    bg: "bg-gradient-to-br from-red-500 to-red-700",
    color: "text-red-700",
    icon: <Trash2 className="w-5 h-5" />
  },
};

  // Refs for click outside handling
  const notificationModalRef = useRef(null);
  const bellButtonRef = useRef(null);
  const profileModalRef = useRef(null);
  const profileButtonRef = useRef(null);

  useEffect(()=>{
    const handleMsgNotification = async ({notifications}) => {
      console.log('Notification received', notifications);
      
      try {
         play();
        console.log('Sound played successfully');
      } catch (error) {
        console.error('Error playing sound:', error);
        
        const playWithUserInteraction = () => {
          play();
          document.removeEventListener('click', playWithUserInteraction);
        };
        document.addEventListener('click', playWithUserInteraction);
      }

      setNotificationDetails(notifications || [])
      setHasNotifications(true)
    }


   

    const getNotificationFromApi = async()=>{
      try {
        const res = await axios.get("http://localhost:3000/notification/api/getMessageNotification",{withCredentials:true})
        setNotificationDetails(res.data.notifications || [])
        if(res.data.notifications && res.data.notifications.length > 0) {
          setHasNotifications(true)
        }
      } catch (error) {
        console.log("can't fetch notification from api due to this",error);
      }
    }

    getNotificationFromApi()
    socket.on("notifications_msg",handleMsgNotification)

    return () => socket.off("notifications_msg")
  },[play])

   useEffect(()=>{


      getExactUserInfo()
    },[userData.id])

    const getExactUserInfo = async ()=>{

      setLoading(true)

      try {
        
              const res = await axios.get("http://localhost:3000/setting/api/getExactInvitation",{withCredentials:true})
        
          console.log("data sent for invitation",res.data.info);
          
          setExactInfos(res.data.info)
      
        
      } catch (error) {

        console.log("can't fetch exact infos due to this",error);
        
        
      }finally{

        setLoading(false)
      }
    }

  useEffect(()=>{
    const handleOtherNotifications = ({type , name,content,memberId}) => {
      console.log('Other notification received:', {name, content, memberId});
      
     
        const notificationUpdate = {name, content, timestamp: Date.now()}
        setOtherNotifications(prev => [notificationUpdate, ...prev])

      setHasNotifications(true)

      
    }

    const addOtherNotificationFromApi = async ()=>{
      try {
        const res = await axios.get("http://localhost:3000/notification/api/getAllNotifications",{withCredentials:true})
        console.log("other notification check data",res.data);
        
        if(res.data.notification && res.data.notification.length > 0) {
          setOtherNotifications(res.data.notification || [])
          setHasNotifications(true)
        }
      } catch (error) {
        console.log("can't fetch notifications due to this",error);
      }
    }

    addOtherNotificationFromApi()
    socket.on("notifications_update", handleOtherNotifications)

    return () => socket.off("notifications_update",handleOtherNotifications)
  },[])

  function getInitialsGroup(name) {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

  
  const handleNotificationClick = (e) => {
    e.stopPropagation();
    setOpenNotification(prev => !prev);
    if (!openNotification) {
      setHasNotifications(false)
    }
  }

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setOpenProfileModal(prev => !prev);
  }

  // Click outside handler for notifications
  useEffect(() => {
    if (!openNotification) return;
    
    const handleClick = (e) => {
      if (
        bellButtonRef.current &&
        bellButtonRef.current.contains(e.target)
      ) {
        return;
      }
      
      if (
        notificationModalRef.current &&
        !notificationModalRef.current.contains(e.target)
      ) {
        setOpenNotification(false);
      }
    };
    
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openNotification]);

  // Click outside handler for profile modal
  useEffect(() => {
    if (!openProfileModal) return;
    
    const handleClick = (e) => {
      if (
        profileButtonRef.current &&
        profileButtonRef.current.contains(e.target)
      ) {
        return;
      }
      
      if (
        profileModalRef.current &&
        !profileModalRef.current.contains(e.target)
      ) {
        setOpenProfileModal(false);
      }
    };
    
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openProfileModal]);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 18) return "Good afternoon,";
    return "Good evening,";
  }

  return (
    <header className="bg-white/60 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/20">
      <div className="flex items-center justify-between px-8 py-4">
        
        {/* Premium Greeting */}
        <div className="flex-1">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{getGreeting()}</p>
            <h1 className="text-3xl font-bold text-gray-900">Welcome {userData.firstName}</h1>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center space-x-5">
          
          {/* Notification */}
          <div className="relative">
            <button
              ref={bellButtonRef}
              className="p-3 rounded-2xl bg-white hover:bg-gray-50 shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
              {hasNotifications && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse" />
              )}
            </button>

            {openNotification && (
              <div
                className="absolute rounded-2xl bg-white/95 backdrop-blur-lg z-50 w-[380px] min-h-[80px] max-h-[500px] flex flex-col shadow-2xl border border-white/20 overflow-hidden animate-fade-in"
                ref={notificationModalRef}
                style={{ top: 65, right: -180 }}
              >
                {/* Header */}
                <div className="px-6 py-4 bg-white border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-gray-800 font-bold text-lg">Notifications</h1>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {/* Message Notifications */}
                  <div className="px-6 py-4 border-b border-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" />
                        Messages
                      </h2>
                      <button
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        onClick={() => setNotificationDetails([])}
                        title="Clear Messages"
                        type="button"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {notificationDetails.length > 0 ? (
                        notificationDetails.map((notif, idx) => {
                          let displayName = notif.isGroup
                            ? notif.chatName || notif.projectId?.name || notif.teamId?.name || "Group"
                            : notif.members
                                .filter(m => m._id !== userData.id)
                                .map(m => `${m.firstName} ${m.lastName}`)[0] || "Direct Chat";

                          return (
                            <div
                              key={notif._id || idx}
                              className="flex items-center gap-3 p-3 rounded-xl bg-white/70 hover:bg-white shadow-sm hover:shadow-md border border-gray-100/50 transition-all duration-200 "
                            >
                              {/* Avatar */}
                              {notif.isGroup
                                ? notif.projectId?.avatarUrl ? (
                                    <img
                                      src={notif.projectId.avatarUrl}
                                      alt={notif.projectId.name}
                                      className="w-10 h-10 rounded-xl object-cover border-2 border-blue-100"
                                    />
                                  ) : notif.projectId?.name ? (
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                      {getInitialsGroup(notif.projectId.name)}
                                    </div>
                                  ) : notif.teamId?.name ? (
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                      {notif.teamId.name[0]}
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                      G
                                    </div>
                                  )
                                : notif.lastMsg?.sender?.avatar ? (
                                    <img
                                      src={notif.lastMsg.sender.avatar}
                                      alt={notif.lastMsg.sender.firstName}
                                      className="w-10 h-10 rounded-xl object-cover border-2 border-blue-100"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                      {notif.lastMsg?.sender?.firstName?.[0]}
                                      {notif.lastMsg?.sender?.lastName?.[0]}
                                    </div>
                                  )
                              }
                              
                              {/* Content */}
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm text-gray-800 font-semibold truncate">
                                  {notif.isGroup
                            ?  notif.projectId?.name || notif.teamId?.name || "Group"
                            : notif.members
                                .filter(m => m._id !== userData.id)
                                .map(m => `${m.firstName} ${m.lastName}`)[0] || "Direct Chat"}
                                </span>
                                <span className="text-sm text-gray-600 truncate">
                                  {notif.lastMsg?.text}
                                </span>
                              </div>
                              
                              {/* Badge */}
                              {notif.unreadCount > 0 && (
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold shadow-lg">
                                  {notif.unreadCount}
                                </span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6">
                          <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">No messages</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Other Notifications */}
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                        <Bell className="w-3 h-3" />
                        Updates
                      </h2>
                      <button 
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        type='button' 
                        title='Clear Updates' 
                        onClick={() => setOtherNotifications([])}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {otherNotifications.length > 0 ? (
                        otherNotifications.map((notif, idx) => {
                          const theme = notifTheme[notif.name] || {
                            bg: "bg-gradient-to-br from-gray-400 to-gray-500",
                            color: "text-gray-700",
                            icon: <Bell className="w-5 h-5" />
                          };
                          
                          return (
                            <div
                              key={notif.name + idx + (notif.timestamp || '')}
                              className="flex items-center gap-3 p-3 rounded-xl bg-white/70 hover:bg-white shadow-sm hover:shadow-md border border-gray-100/50 transition-all duration-200"
                            >
                              {/* Icon */}
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${theme.bg}`}>
                                {theme.icon}
                              </div>
                              
                              {/* Content */}
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className={`text-sm font-semibold mb-1 ${theme.color}`}>
                                  {notif.name}
                                </span>
                                <span className="text-xs text-gray-600 leading-relaxed break-words">
                                  {notif.content}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6">
                          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">No updates</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button 
              ref={profileButtonRef}
              className="
                flex items-center space-x-3 pl-3 pr-4 py-2.5 
                bg-white hover:bg-gray-50
                rounded-2xl 
                shadow-[0_2px_12px_rgba(0,0,0,0.08)]
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/30
              "
              onClick={handleProfileClick}
              type="button"
            >
              <div className="
                w-10 h-10 rounded-xl 
                bg-gradient-to-br from-blue-500 to-blue-600 
                flex items-center justify-center 
                text-white font-semibold
                shadow-lg shadow-blue-600/25
              ">
                {userData.avatar ? 
                  <img src={userData.avatar} className='w-10 h-10 rounded-xl object-cover'/> : 
                  <div className='text-white font-normal'>{userData.firstName[0]+userData.lastName[0]}</div>
                }
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-gray-900">{userData.firstName}</div>
                {userData.role === 'manager' ? <div className="text-xs text-gray-500">{userData.role}</div> : <>{loading ? <div className="text-xs text-gray-500">-</div> : <div className="text-xs text-gray-500">{exactInfo.post}</div>}</>} 
                 
              </div>
            </button>

            {openProfileModal && (
              <div
                className="absolute rounded-2xl bg-white/95 backdrop-blur-lg z-50 w-[360px] min-h-[120px] max-h-[300px] flex flex-col shadow-2xl border border-white/20 overflow-hidden animate-fade-in"
                style={{ top: 70, right: -32 }}
                ref={profileModalRef}
              >
                {/* Premium Profile Modal Header */}
                <div className="flex items-center gap-4 px-6 pt-5 pb-3 border-b border-gray-100 bg-white ">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-xl">
                      {userData.avatar ? (
                        <img src={userData.avatar} className='w-11 h-11 rounded-2xl object-cover'/>
                      ) : (
                        <span>{userData.firstName[0]}{userData.lastName[0]}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-md font-bold text-gray-900 mb-1">{userData.firstName} {userData.lastName}</div>
                    <div className="text-xs text-gray-600 font-medium bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full inline-block">
                                        {userData.role === 'manager' ? <div className="text-xs text-gray-500">{userData.role}</div> : <>{loading ? <div className="text-xs text-gray-500">-</div> : <div className="text-xs text-gray-500">{exactInfo.post}</div>}</>} 

                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex flex-col px-3 py-3 gap-3">
                  <button
                    className="group flex items-center gap-4 w-full px-4 py-3 rounded-2xl bg-white hover:bg-gradient from-blue-50 hover:to-purple-50 border border-gray-100 hover:border-blue-200 text-gray-700 hover:text-blue-700 font-semibold text-base shadow-sm  transition-all duration-300 transform "
                    type="button"
                    onClick={()=>{navigate('/workspace/settings')}}
                  >
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-normal">Settings</div>
                      <div className="text-xs text-gray-500 group-hover:text-blue-500">Manage your preferences</div>
                    </div>
                  </button>

                  <button
                    className="group flex items-center gap-4 w-full px-4 py-3 rounded-2xl bg-white hover:from-red-100 hover:to-pink-100 border border-red-100 hover:border-red-200 text-red-600 hover:text-red-700 font-semibold text-base shadow-sm  transition-all duration-300 transform "
                    type="button"
                    onClick={async ()=>{
                      await logout()

                      window.location.href='/login'
                    }}
                  >
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-normal">Sign Out</div>
                      <div className="text-xs text-gray-500 group-hover:text-red-500">Logout from your account</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;