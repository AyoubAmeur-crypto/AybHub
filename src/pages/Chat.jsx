import React, { useEffect, useState, useCallback } from "react";
import socket from "../utils/socket";
import axios from "axios";
import UseFetch from "../hooks/UseFetch";
import ChatMessageSection from "../components/chat/ChatMessageSection";
import Loading from "../components/Loading";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const userData = UseFetch();
  const [unreadCounts, setUnreadCounts] = useState({});
  const [online, setOnline] = useState([]);
    const [loading,setLoading]=useState(false)



function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360; 
  const lightness = 28 + (Math.abs(hash) % 10); 
  return `hsl(${hue}, 75%, ${lightness}%)`;
}

function getInitials(name) {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}


  useEffect(() => {
    if (userData.id) {
      socket.emit('join_user_room', userData.id);
      console.log(`Client joined user room: user:${userData.id}`);

      const handleReadMessageGlobal = ({ conversationId: updatedConversationId, reader }) => {
        setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conv => {
            if (conv._id.toString() === updatedConversationId.toString() && conv.lastMsg) {
              const isMyMessage = conv.lastMsg.sender?._id === userData.id;

              if (isMyMessage && !(conv.lastMsg.readBy || []).some(user => user._id === reader._id)) {
                return {
                  ...conv,
                  lastMsg: {
                    ...conv.lastMsg,
                    readBy: [...(conv.lastMsg.readBy || []), reader]
                  },
                  updatedAt: new Date().toISOString()
                };
              }
            }
            return conv;
          });
          return updatedConversations;
        });
      };

      socket.on("read_message", handleReadMessageGlobal);

      return () => {
        socket.off("read_message", handleReadMessageGlobal);
      };
    }
  }, [userData.id]);

  // FIXED: Emit online_user event only when userData.id is available
  useEffect(() => {
    if (userData.id) {
      socket.emit("online_user", { userId: userData.id });
      console.log(`Client: Emitted online_user for user ${userData.id}`);
    }
  }, [userData.id]);

  // FIXED: Listen for online users updates with proper event name
  useEffect(() => {
    const handleOnlineUsersUpdate = ({ onlineUsers }) => {
      console.log("Client: Received online users update:", onlineUsers);
      setOnline(Array.isArray(onlineUsers) ? onlineUsers : []);
    };

    socket.on("online_users_updated", handleOnlineUsersUpdate);

    return () => {
      socket.off("online_users_updated", handleOnlineUsersUpdate);
    };
  }, []);

  // FIXED: Listen to the new 'sidebar_conversation_update' event from backend
  useEffect(() => {
    if (userData.id) {

       const handleSidebarConversationUpdate = ({ conversation, senderId }) => {
      console.log("Chat: Received sidebar_conversation_update", conversation, senderId);
      
      setConversations(prevConversations => {
        const conversationId = conversation._id.toString();
        const existingConvIndex = prevConversations.findIndex(conv => conv._id.toString() === conversationId);

        let newConversations;
        if (existingConvIndex !== -1) {
          // FIXED: Properly merge the conversation data, especially lastMsg
          const existingConv = prevConversations[existingConvIndex];
          const updatedConv = {
            ...existingConv,
            ...conversation,
            // Ensure lastMsg is properly updated
            lastMsg: conversation.lastMsg || existingConv.lastMsg,
            // Ensure updatedAt is properly set for sorting
            updatedAt: conversation.updatedAt || new Date().toISOString()
          };
          
          // Move updated conversation to the top
          newConversations = [updatedConv, ...prevConversations.filter((_, i) => i !== existingConvIndex)];
        } else {
          // Add new conversation at the top
          newConversations = [conversation, ...prevConversations];
        }

        // FIXED: Sort conversations by updatedAt to ensure proper order
        newConversations.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB - dateA; // Most recent first
        });

        console.log("Chat: Updated conversations after sidebar update:", newConversations.map(c => ({
          id: c._id,
          lastMsg: c.lastMsg?.text?.substring(0, 20) + "...",
          updatedAt: c.updatedAt
        })));

        return newConversations;
      });

      // Update unread count from the backend calculation
      setUnreadCounts(prevCounts => ({
        ...prevCounts,
        [conversation._id.toString()]: conversation.unreadCount || 0
      }));

      // FIXED: If this conversation is currently selected, update it with latest data
      setSelectedConversation(prevSelected => {
        if (prevSelected?._id?.toString() === conversation._id.toString()) {
          return {
            ...prevSelected,
            ...conversation,
            lastMsg: conversation.lastMsg || prevSelected.lastMsg
          };
        }
        return prevSelected;
      });
    };

    const handleUnreadCountCleared = ({ conversationId }) => {
      console.log("Chat: Received unread_count_cleared for", conversationId);
      setUnreadCounts(prevCounts => ({
        ...prevCounts,
        [conversationId]: 0
      }));
    };

    socket.on("sidebar_conversation_update", handleSidebarConversationUpdate);
    socket.on("unread_count_cleared", handleUnreadCountCleared);

    return () => {
      socket.off("sidebar_conversation_update", handleSidebarConversationUpdate);
      socket.off("unread_count_cleared", handleUnreadCountCleared);
    };
    }
  }, [userData.id]);

  const fetchConversations = async () => {
  setLoading(true);
  try {
    const res = await axios.get("http://localhost:3000/chat/api/getAllConversations", { withCredentials: true });

    const filteredConversations = res.data.conversations.filter(conv => {
      if (!conv.isGroup && conv.members.length === 2) {
        const otherMember = conv.members.find(m => m._id?.toString() !== userData.id?.toString());
        return otherMember && otherMember._id;
      }
      return true;
    });

    // FIXED: Sort conversations by updatedAt
    filteredConversations.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA; // Most recent first
    });

    setConversations(filteredConversations);

    // Initialize unread counts based on fetched conversations
    const initialUnread = {};
    filteredConversations.forEach(conv => {
      if (conv.unreadCount !== undefined && conv.unreadCount > 0) {
        initialUnread[conv._id.toString()] = conv.unreadCount;
      }
    });
    setUnreadCounts(initialUnread);

    filteredConversations.forEach(conv => {
      socket.emit("room_connection", conv._id);
    });
  } catch (error) {
    console.log("can't find conversations due to this", error);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    if (userData.id) {
      fetchConversations();
    }
  }, [userData.id]);

  useEffect(() => {
    const refetch = () => fetchConversations();
    window.addEventListener("refetchConversations", refetch);
    return () => window.removeEventListener("refetchConversations", refetch);
  }, []);

  const handleConversationClick = useCallback((conv) => {
    setSelectedConversation(conv);
    
    // FIXED: Only emit mark_as_read if there are actually unread messages
    const currentUnreadCount = unreadCounts[conv._id.toString()] || 0;
    if (currentUnreadCount > 0) {
      // Emit event to the server to mark messages as read
      socket.emit("mark_as_read", { conversationId: conv._id, userId: userData.id });
    }
    
    // The unread count will be cleared by the 'unread_count_cleared' event from the server
  }, [userData.id, unreadCounts]);

  const getConversationDisplay = (conv) => {
    const isGroup = conv.isGroup;

    if (isGroup) {
      const displayName = conv.projectId?.name || conv.teamId?.name || conv.chatName || "Group";
      const avatarLetter = displayName.charAt(0).toUpperCase();

      return {
        displayName,
        avatarLetter,
        isGroup: true
      };
    } else {
      const otherMember = conv.members.find(m => m._id?.toString() !== userData.id?.toString());

      if (!otherMember) {
        return null;
      }

      const displayName = otherMember.firstName && otherMember.lastName
        ? `${otherMember.firstName} ${otherMember.lastName}`
        : "Unknown User";

      const avatarLetter = otherMember.firstName && otherMember.lastName
        ? `${otherMember.firstName.charAt(0)}${otherMember.lastName.charAt(0)}`
        : "?";

      return {
        displayName,
        avatarLetter,
        isGroup: false,
        otherMember
      };
    }
  };
 
  return (
    <div className="max-w-8xl rounded-xl bg-white overflow-hidden border border-gray-100 shadow-2xl">
      <div className="grid grid-cols-4 gap-0 h-[550px]">
        {/* Members List - Premium Sidebar */}
        <div className="col-span-1 border-r border-gray-100 bg-white/60 flex flex-col h-[550px]">
          {/* Header with gradient */}
          <div className="border-b border-gray-200 px-6 py-5.5 shadow-sm backdrop-blur-sm">
            <h3 className="font-normal text-lg flex items-center gap-3">
  <span className="inline-block">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="bubbleBlue" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#1e40af" />
        </linearGradient>
        <filter id="bubbleShadow" x="-5" y="-5" width="42" height="42" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2563eb" floodOpacity="0.18" />
        </filter>
      </defs>
      <g filter="url(#bubbleShadow)">
        <ellipse cx="16" cy="14" rx="12" ry="10" fill="url(#bubbleBlue)" />
        <ellipse cx="16" cy="14" rx="12" ry="10" fill="url(#bubbleBlue)" opacity="0.7"/>
        <path d="M10 26c0-2 4-2 6-2s6 0 6 2c0 1-2 2-6 2s-6-1-6-2z" fill="#2563eb" opacity="0.5"/>
      </g>
      <circle cx="12" cy="14" r="2" fill="#fff" opacity="0.7"/>
      <circle cx="16" cy="14" r="2" fill="#fff" opacity="0.7"/>
      <circle cx="20" cy="14" r="2" fill="#fff" opacity="0.7"/>
    </svg>
  </span>
  <span className=" text-blue-700 font-semibold ">
    Conversations
  </span>
</h3>
          </div>
          
          {/* Scrollable conversation list */}
          {loading ? <Loading message="Chat Sync..."/> : <div className="flex-1 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
            <style>
              {`
                ::-webkit-scrollbar {
                  width: 4px;
                }
                ::-webkit-scrollbar-track {
                  background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                  background: #e5e7eb;
                  border-radius: 2px;
                }
                ::-webkit-scrollbar-thumb:hover {
                  background: #d1d5db;
                }
              `}
            </style>
            <ul className="space-y-1">
              {conversations?.map((conv) => {
                const displayInfo = getConversationDisplay(conv);
                const unreadCount = unreadCounts[conv._id.toString()] || 0;

                if (!displayInfo) {
                  return null;
                }

                // For direct chats, get avatar from otherMember
                const avatarUrl = !displayInfo.isGroup && displayInfo.otherMember?.avatar
                  ? displayInfo.otherMember.avatar
                  : (conv.projectId?.avatarUrl || null);

                // FIXED: Check if other user is online with proper ID comparison
                const isOtherUserOnline = !displayInfo.isGroup && displayInfo.otherMember
                  ? online.includes(displayInfo.otherMember._id.toString())
                  : false;

                return (
                  <li key={conv._id}>
                    <button
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 transform ${
                        selectedConversation?._id === conv._id
                          ? "bg-blue-700 text-gray-500 shadow-lg"
                          : "bg-white hover:bg-blue-50 border border-gray-100 hover:border-blue-200"
                      }`}
                      onClick={() => handleConversationClick(conv)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={displayInfo.displayName}
                              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) :
                          
                          <>{displayInfo.isGroup ? (
  <div
    className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm shadow-sm`}
    style={{
      background: stringToColor(displayInfo.displayName),
      color: "#fff",
      border: selectedConversation?._id === conv._id ? "2px solid #a5b4fc" : "none"
    }}
  >
    {getInitials(displayInfo.displayName)}
  </div>
) : (
  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm shadow-sm ${
    selectedConversation?._id === conv._id
      ? "bg-white text-blue-600 border-2 border-blue-100"
      : "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
  }`}>
    {displayInfo.avatarLetter}
  </div>
)}</>}
                          
                          {/* FIXED: Online indicator - only show for direct chats */}
                          {!displayInfo.isGroup && (
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                              isOtherUserOnline ? "bg-green-500" : "bg-gray-400"
                            }`}></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`font-semibold truncate ${
                              selectedConversation?._id === conv._id ? "text-white" : "text-gray-900"
                            }`}>
                              {displayInfo.displayName}
                            </p>
                            {/* FIXED: Show online/offline status text only for direct chats */}
                            {!displayInfo.isGroup && (
                              <span className={`text-xs font-medium ${
                                selectedConversation?._id === conv._id 
                                  ? "text-blue-100" 
                                  : isOtherUserOnline ? "text-green-500" : "text-gray-400"
                              }`}>
                                
                              </span>
                            )}
                          </div>
                          <p className={`text-sm truncate ${
                            selectedConversation?._id === conv._id ? "text-blue-100" : "text-gray-500"
                          }`}>
                            {conv.lastMsg?.text || "No messages yet"}
                          </p>
                        </div>
                        {unreadCount > 0 && (
                          <div className="flex items-center">
                            <span className={`bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md ${
                              selectedConversation?._id === conv._id ? "bg-white text-blue-600" : ""
                            }`}>
                              {unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>}

        </div>

        {/* Chat Section */}
        <div className="col-span-3 h-[550px] bg-gradient-to-br from-gray-50 to-white">
          <ChatMessageSection
            selectedConversation={selectedConversation}
            userData={userData}
            online={online}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;