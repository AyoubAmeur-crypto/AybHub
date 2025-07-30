import React, { useEffect, useState, useRef, useCallback } from 'react';
import socket from "../../utils/socket";
import axios from "axios";
import { Send, Smile, Phone, Video, MoreHorizontal, Check } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import '../../App.css'

function ChatMessageSection({ selectedConversation, userData , online }) { // No onMessageSent prop, as requested
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const chatEndRef = useRef(null);
  const scrollRef = useRef(false); 
  const textareaRef = useRef(null); // Add textarea ref
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const lightness = 28 + (Math.abs(hash) % 10); // 28% to 38% (dark)
  return `hsl(${hue}, 75%, ${lightness}%)`;
}

// Get two initials from a name

    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const lightness = 28 + (Math.abs(hash) % 10); // 28% to 38% (dark)
  return `hsl(${hue}, 75%, ${lightness}%)`;
}

function getInitialsGroup(name) {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Get two initials from a name


  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji.native);
  };

  // Ref to hold the current conversationId, useful inside socket listeners
  const conversationIdRef = useRef(conversationId);
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Combined scroll logic for initial load and new messages
  useEffect(() => {
    if (chatEndRef.current) {
      // If scrollRef is true (new message arrived or just sent), scroll smoothly.
      // Otherwise (initial load or conversation switch), jump directly.
      chatEndRef.current.scrollIntoView({ behavior: scrollRef.current ? "smooth" : "auto" });
      scrollRef.current = false; // Reset the flag after scrolling
    }
  }, [chats]); // Re-run when chats array updates

  // Function to mark messages in the current conversation as read
  const markMessagesAsRead = async (convId) => {
    if (!convId || !userData?.id) {
      console.log("ChatMessageSection: Skipping markMessagesAsRead - missing convId or userData.id");
      return;
    }

    try {
      // Make API call to backend to update read status in database
      await axios.post(`http://localhost:3000/chat/api/readMessage`, {
        conversationId: convId
      }, { withCredentials: true });

      // Emit 'mark_as_read' event to the server via socket
      socket.emit("mark_as_read", {
        conversationId: convId,
        userId: userData.id, // Send the user ID who read the messages
        reader: { // Include reader details for other clients to update readBy status
          _id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData.avatar,
        }
      });
      console.log(`ChatMessageSection: Messages in conversation ${convId} marked as read by ${userData.id}`);
    } catch (error) {
      console.error("ChatMessageSection: Failed to update readBy status:", error);
    }
  };

  // Effect to handle conversation selection changes
  useEffect(() => {
    if (selectedConversation && selectedConversation._id) {
      const newConversationId = selectedConversation._id;
      setConversationId(newConversationId);
      console.log(`ChatMessageSection: Selected conversation changed to: ${newConversationId}`);

      // Join the specific conversation room on the server
      socket.emit("room_connection", newConversationId);
      console.log(`ChatMessageSection: Emitted 'room_connection' for ${newConversationId}`);

      // Fetch message history for the newly selected conversation
      const getAllmessage = async () => {
        try {
          const res = await axios.post("http://localhost:3000/chat/api/getAllMessageHistory", {
            conversationId: newConversationId
          }, { withCredentials: true });
          console.log("ChatMessageSection: Fetched chat history:", res.data.chats);
          // Ensure fetched messages have a 'delivered' status if they don't have 'sending'
          const fetchedChatsWithStatus = res.data.chats.map(chat => ({
            ...chat,
            status: chat.status || 'delivered' // Set to 'delivered' if no status is present
          }));
          setChats(fetchedChatsWithStatus);
          scrollRef.current = true; // Mark for smooth scroll to bottom after fetching history
          markMessagesAsRead(newConversationId); // Mark messages as read when conversation is opened
        } catch (error) {
          console.error("ChatMessageSection: Can't fetch message history due to:", error);
        }
      };
      getAllmessage();
    } else {
      // Clear chats and conversationId if no conversation is selected
      console.log("ChatMessageSection: No conversation selected, clearing chats.");
      setChats([]);
      setConversationId(null);
    }
  }, [selectedConversation, userData.id]); // Re-run when selectedConversation or userData changes

  // Effect to listen for new messages (for active chat window display)
 useEffect(() => {
  // FIX: Correctly destructure clientId from the payload
  const handleNewMessage = ({ message: serverMessage, clientId }) => { 
    console.log("ChatMessageSection: Received 'new_message'. Server Message:", serverMessage, "Client ID:", clientId);
    console.log("ChatMessageSection: Current conversationIdRef:", conversationIdRef.current);

    // Only process messages for the currently active conversation
    if (serverMessage.conversation.toString() === conversationIdRef.current.toString()) {
      console.log("ChatMessageSection: Message is for current conversation.");
      setChats(prevChats => {
        const isMyMessage = serverMessage.sender?._id === userData.id;
        // Add a 'status' field to the incoming server message, assuming 'delivered' upon receipt
        const confirmedServerMessage = { ...serverMessage, status: 'delivered' };

        let newChatsArray = [];
        let messageFoundAndUpdated = false;

        // Case 1: This is a confirmation for an optimistic message I sent
        if (isMyMessage && clientId) {
          console.log(`ChatMessageSection: It's my message (${userData.id}) with clientId: ${clientId}. Attempting to replace optimistic.`);
          
          // FIXED: Replace optimistic message with server confirmation
          newChatsArray = prevChats.map(chat => {
            // Match the optimistic message by its clientId and 'sending' status
            if (chat.clientId === clientId && chat.status === 'sending') {
              console.log(`  MATCH! Replacing optimistic message with clientId: ${clientId} with server message ID: ${confirmedServerMessage._id}`);
              messageFoundAndUpdated = true;
              // Replace the optimistic message with the confirmed server message
              return {
                ...confirmedServerMessage,
                _id: confirmedServerMessage._id, // Use the real server ID
                status: 'delivered' // Set status to delivered
              };
            }
            return chat;
          });

          // If no optimistic message was found to replace, add the confirmed message
          if (!messageFoundAndUpdated) {
            console.log(`  No optimistic message found with clientId: ${clientId}. Adding confirmed message.`);
            // Check if message already exists by server ID to avoid duplicates
            const existsByServerId = prevChats.some(chat => chat._id === confirmedServerMessage._id);
            if (!existsByServerId) {
              newChatsArray = [...prevChats, confirmedServerMessage];
            } else {
              newChatsArray = prevChats; // Message already exists, no change
            }
          }
        } else {
          // Case 2: This is a new message from another user
          console.log(`ChatMessageSection: Message from other user. Adding if not exists.`);
          // Check if message already exists by server ID
          const existsByServerId = prevChats.some(chat => chat._id === confirmedServerMessage._id);
          if (!existsByServerId) {
            newChatsArray = [...prevChats, confirmedServerMessage];
            console.log(`  Added new message from other user by _id: ${confirmedServerMessage._id}`);
          } else {
            console.log(`  Message already exists by _id: ${confirmedServerMessage._id}. No change.`);
            newChatsArray = prevChats; // Message already exists, no change
          }
        }

        // Mark for smooth scroll if the user is near the bottom of the chat after any update
        const container = chatEndRef.current?.parentElement;
        if (container && (container.scrollHeight - container.scrollTop <= container.clientHeight + 100)) {
          scrollRef.current = true; // Flag for smooth scroll
        }
        
        console.log("ChatMessageSection: Final chats state after new_message:", newChatsArray.map(c => ({ 
          id: c._id, 
          clientId: c.clientId, 
          status: c.status, 
          text: c.text.substring(0,15) + "..." 
        })));
        
        return newChatsArray;
      });
    } else {
      console.log("ChatMessageSection: Message not for current conversation. Skipping.");
    }
  };

  socket.on("new_message", handleNewMessage);

  return () => {
    socket.off("new_message", handleNewMessage);
  };
}, [userData.id]);

  // Effect to listen for read receipts (for updating message statuses like double checkmarks)
  useEffect(() => {
    const handleReadMessage = ({ conversationId: updatedConversationId, reader }) => {
      console.log("ChatMessageSection: Received 'read_message'. Conv ID:", updatedConversationId, "Reader:", reader._id);
      if (updatedConversationId.toString() === conversationIdRef.current.toString()) {
        setChats(prevChats => {
          let hasChanged = false;
          const newChats = prevChats.map(message => {
            const isMyMessage = message.sender?._id === userData.id || message.sender === userData.id;

            // Update readBy for my messages if the reader isn't me and they haven't read it yet
            if (
              isMyMessage &&
              !(message.readBy || []).some(user => user._id === reader._id)
            ) {
              hasChanged = true;
              console.log(`  Updating readBy for my message ID: ${message._id} by reader: ${reader._id}`);
              return {
                ...message,
                readBy: [...(message.readBy || []), reader]
              };
            }
            return message;
          });
          return hasChanged ? newChats : prevChats;
        });
      }
    };

    socket.on("read_message", handleReadMessage);

    return () => {
      socket.off("read_message", handleReadMessage);
    };
  }, [userData.id]);

  // Function to reset textarea height
  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '48px'; // Reset to initial height
      textareaRef.current.style.overflowY = 'hidden';
    }
  };

  // Function to handle sending a message (optimistic UI)
  const handleSend = useCallback(() => {
    if (message.trim() && conversationId && userData.id) {
      // Generate a unique client-side ID for optimistic updates
      const clientId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create an optimistic message object to display immediately
      const optimisticMessage = {
        _id: clientId, // Temporary ID for display
        clientId: clientId, // Used to match with server's confirmed message
        conversation: conversationId,
        text: message.trim(),
        sender: {
          _id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData.avatar,
        },
        createdAt: new Date().toISOString(),
        readBy: [{ // Optimistically mark as read by sender
          _id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData.avatar,
        }],
        status: 'sending' // Custom status for visual feedback
      };

      console.log("ChatMessageSection: Sending optimistic message:", optimisticMessage);
      // Add the optimistic message to the local chat state
      setChats(prevChats => [...prevChats, optimisticMessage]);

      // Emit the message to the server, including the clientId
      socket.emit("send_message", {
        conversationId: conversationId,
        text: message.trim(),
        sender: userData.id,
        clientId: clientId,
      });

      setMessage("");
      setShowEmojiPicker(false);
      scrollRef.current = true;
      
      // Reset textarea height after sending
      resetTextareaHeight();
    }
  }, [message, conversationId, userData.id]);

  // Handle textarea input changes with dynamic height
  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    
    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = 'auto';
    
    // Calculate new height
    const newHeight = e.target.scrollHeight;
    const maxHeight = 144; // approximately 6 lines (24px per line)
    
    if (newHeight <= maxHeight) {
      e.target.style.height = newHeight + 'px';
      e.target.style.overflowY = 'hidden';
    } else {
      e.target.style.height = maxHeight + 'px';
      e.target.style.overflowY = 'auto';
    }
  };

  // Handle Enter key press to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line in textarea
      handleSend();
    }
  };

  // Helper functions for rendering avatars, time, and header info
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date)) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderAvatar = (user, size = "w-8 h-8", textSize = "text-[12px]") => {
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={`${user.firstName} ${user.lastName}`}
        className={`${size} rounded-full object-cover shadow-sm border-2 border-white`}
      />
    );
  }
    return (
       <div className={`${size} rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-normal ${textSize} shadow-sm border border-white overflow-hidden`}>
      {getInitials(user?.firstName, user?.lastName)}
    </div>
    );
  };

  const getHeaderInfo = () => {
    if (!selectedConversation) return { avatar: null, name: "" };

    if (selectedConversation.groupType === "project" && selectedConversation.projectId) {
      return {
        avatar: selectedConversation.projectId.avatarUrl || null,
        name: selectedConversation.projectId.name || selectedConversation.chatName || "Project Group",
        type: "project"
      };
    }
    if (selectedConversation.groupType === "team" && selectedConversation.teamId) {
      return {
        name: selectedConversation.teamId.name || selectedConversation.chatName || "Team Group",
        type: "team"
      };
    }
    if (!selectedConversation.isGroup) {
      const otherMember = selectedConversation.members?.find(m => m._id !== userData.id);
      return {
        avatar: otherMember?.avatar || null,
        name: otherMember ? `${otherMember.firstName} ${otherMember.lastName}` : "Unknown",
        type: "direct",
        otherMember
      };
    }
    return {
      avatar: null,
      name: selectedConversation.chatName || "Group",
      type: "group"
    };
  };

  const headerInfo = getHeaderInfo();

  const isOtherUserOnline =
  headerInfo.type === "direct" && headerInfo.otherMember
    ? online.includes(headerInfo.otherMember._id.toString())
    : false;

  // Render a placeholder if no conversation is selected
  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white h-[550px] rounded-lg">
        <div className="text-center p-8 bg-white/60 ">
          <div className="flex items-center justify-center  mb-4 ">
                <div class="typewriter">
  <div class="slide"><i></i></div>
  <div class="paper"></div>
  <div class="keyboard"></div>
</div>
          </div>
          <h3 className="text-xl font-bold text-gray-500 mb-0.5">Select a conversation</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Choose a contact or group from the left to start chatting!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white overflow-hidden shadow-inner">
      {/* Header - Premium Design */}
      <div className="flex-shrink-0 bg-white/60 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center space-x-4">
         {headerInfo.avatar ? (
  <div className="relative">
    <img src={headerInfo.avatar} className="h-11 w-11 rounded-full object-cover shadow-lg border-2 border-white" alt={headerInfo.name} />
  </div>
) : (
  <div className="relative">
    {(headerInfo.type === "team" || headerInfo.type === "project" || headerInfo.type === "group") ? (
      <div
        className="rounded-full flex items-center justify-center text-white font-bold h-11 w-11 shadow-lg border-2 border-white"
        style={{
          background: stringToColor(headerInfo.name),
          color: "#fff"
        }}
      >
        {getInitialsGroup(headerInfo.name)}
      </div>
    ) : (
      <div className="rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold h-11 w-11 shadow-lg border-2 border-white">
        {headerInfo.otherMember
          ? `${headerInfo.otherMember.firstName?.charAt(0) || ""}${headerInfo.otherMember.lastName?.charAt(0) || ""}`
          : headerInfo.name?.charAt(0)}
      </div>
    )}
  </div>
)}
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900">
              {headerInfo.name}
            </h2>
         {headerInfo.type === "direct" && (
    <p className={`text-xs font-semibold flex items-center ${isOtherUserOnline ? "text-green-600" : "text-gray-400"}`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${isOtherUserOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
      {isOtherUserOnline ? "Online" : "Offline"}
    </p>
  )}
          </div>
        </div>
      </div>

      {/* Messages Area - Premium Theme */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white" style={{ minHeight: 0, scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
        <style>
          {`
            /* Premium scrollbar styling */
            ::-webkit-scrollbar {
              width: 6px;
            }
            ::-webkit-scrollbar-track {
              background: transparent;
            }
            ::-webkit-scrollbar-thumb {
              background: linear-gradient(to bottom, #e5e7eb, #d1d5db);
              border-radius: 3px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(to bottom, #d1d5db, #9ca3af);
            }
            
            /* Premium animations */
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(-20px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideInRight {
              from { opacity: 0; transform: translateX(20px); }
              to { opacity: 1; transform: translateX(0); }
            }
            .animate-fade-in-up {
              animation: fadeInUp 0.4s ease-out forwards;
            }
            .animate-slide-in {
              animation: slideIn 0.3s ease-out forwards;
            }
            .animate-slide-in-right {
              animation: slideInRight 0.3s ease-out forwards;
            }
          `}
        </style>
        <div className="space-y-6">
{chats.map((chat) => {
  const isMyMessage = chat?.sender?._id === userData.id || chat?.sender === userData.id;
  const messageTime = formatTime(chat.createdAt);

  return (
    <div key={chat._id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} ${isMyMessage ? 'animate-slide-in-right' : 'animate-slide-in'}`}>
      <div className={`flex ${isMyMessage ? 'flex-row-reverse' : 'flex-row'} items-end gap-0.75 max-w-xs lg:max-w-md`}>
        {/* Avatar */}
        <div className="flex-shrink-0 self-end">
          {renderAvatar(isMyMessage ? userData : chat?.sender, "w-8 h-8", "text-[13px]")}
        </div>

        {/* Message Bubble & Read Badge */}
        <div className="flex flex-col justify-end flex-2">
          <div className="relative flex flex-col">
            <div className={`px-5 py-1 rounded-2xl text-left shadow-lg transform transition-all duration-200 hover:shadow-xl mt-1 ${
              isMyMessage
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md border-2 border-blue-700'
                : 'bg-white text-gray-800 border-2 border-gray-200 rounded-bl-md hover:border-blue-200'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium break-words break-all">{chat.text}</p>
              {/* Time row inside bubble, above read badge */}
              <div className="flex items-center  space-x-2 justify-end w-full">
                <span className="text-[8px] text-gray-300 font-medium">{messageTime}</span>
              </div>
              {/* Premium message tail */}
              {/* ...your tail code... */}
              {/* Read badge - absolutely positioned outside bubble, bottom left/right */}
              {isMyMessage && chat.readBy && chat.readBy.length > 0 && (
                <div
                  className="absolute flex items-center -space-x-1"
                  style={{ right: -10, bottom: -15 }}
                >
                  <span className="text-xs text-gray-500 mr-0.5">
                    {chat.status === 'sending' ? (
                      <span className="text-blue-500 font-semibold animate-pulse">Sending...</span>
                    ) : chat.readBy.length > 1 ? (
                      <Check className="w-3 h-3 text-green-500 drop-shadow-sm" />
                    ) : (
                      <Check className="w-3 h-3 text-gray-400 drop-shadow-sm" />
                    )}
                  </span>
                  {chat.readBy
                    .filter(user => user._id !== userData.id && user._id !== (chat.sender?._id || chat.sender))
                    .map(user => (
                      <span key={user._id} className="relative group">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.firstName}
                            className="w-4 h-4 rounded-full object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          renderAvatar(user, "w-4 h-4","text-[6px]")
                        )}
                        {/* Premium tooltip */}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
                          {user.firstName}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900"></div>
                        </span>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})}
  
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Premium Message Input */}
      <div className="flex-shrink-0 bg-white/60 border-t border-gray-200 px-6 py-2 shadow-sm backdrop-blur-sm">
        <div className="flex items-center space-x-4 ">
          <button onClick={()=>{setShowEmojiPicker(prev=>!prev)}} className="p-0.75 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-200 shadow-sm hover:shadow-md">
            <Smile className="w-6 h-6" />
          </button>
             {showEmojiPicker && (
              <div tabIndex={-1} onClick={e => e.stopPropagation()} className="absolute z-50 bottom-16 left-0 pop-up-animate">
          <Picker data={data} onEmojiSelect={addEmoji} />
        </div>
            )}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows="1"
              className="w-full px-5 py-3 bg-white rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm shadow-inner"
              placeholder="Type a message..."
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              style={{
                minHeight: '48px',
                maxHeight: '144px',
                overflowY: 'hidden'
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`p-3 rounded-full transition-all duration-200 shadow-lg transform ${
              message.trim()
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl active:scale-95 hover:scale-105'
                : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatMessageSection;