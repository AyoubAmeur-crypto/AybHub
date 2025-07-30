const Chat = require("../models/Chat");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

const onlineUser = new Set()

exports.socketHandler = (io) => {

    io.on("connection", (socket) => {
        console.log("Socket connection started!", socket.id);

        socket.on('join_user_room', (userId) => {
            if (userId) {
                socket.join(`user:${userId}`);
                console.log(`Backend: Socket ${socket.id} joined user room: user:${userId}`);
            }
        });

        socket.on("online_user", (data) => {
            const userId = data.userId;
            if (userId) {
                socket.userId = userId;
                onlineUser.add(userId);
                console.log(`Backend: User ${userId} came online. Online users:`, Array.from(onlineUser));
                
                io.emit("online_users_updated", { onlineUsers: Array.from(onlineUser) });
            }
        });

        socket.on("room_connection", (conversationId) => {
            socket.join(conversationId);
            console.log(`Backend: Socket ${socket.id} joined conversation room: ${conversationId}`);
        });

        socket.on("send_message", async ({ conversationId, text, sender, clientId }) => {
            try {
                const newMsg = await Chat.create({
                    text: text,
                    conversation: conversationId,
                    sender: sender,
                    readBy: [sender] 
                });

                const fullyNewMsg = await Chat.findById(newMsg._id)
                                            .populate("sender", "_id firstName lastName avatar")
                                            .populate("readBy", "_id firstName lastName avatar");

               
                io.to(conversationId).emit("new_message", {
                    message: fullyNewMsg,
                    conversationId: conversationId.toString(), 
                    clientId: clientId 
                });
                console.log(`Backend: Emitted 'new_message' to room ${conversationId} with message ID: ${fullyNewMsg._id} and clientId: ${clientId}`);

                const updatedConversation = await Conversation.findByIdAndUpdate(
                    conversationId,
                    { lastMsg: newMsg._id, updatedAt: newMsg.createdAt }, 
                    { new: true } 
                )
                .populate("members", "_id firstName lastName avatar") 
                .populate("projectId", "name avatarUrl") 
                .populate("teamId", "name")
                .populate({
            path: 'lastMsg',
            model: 'Chat',
            populate: {
                path: 'sender',
                model: 'User',
                select: '_id firstName lastName avatar'
            }
        }); 

                if (!updatedConversation) {
                    console.error("Backend: Conversation not found after sending message:", conversationId);
                    return; 
                }

               
 for (const member of updatedConversation.members) {
                    const memberId = member._id.toString();




                              
                                const unreadCountForMember = await Chat.countDocuments({
                        conversation: updatedConversation._id,
                        sender: { $ne: memberId }, 
                        readBy: { $nin: [memberId] } 
                    });

                    

                    const sidebarConvData = {
                        _id: updatedConversation._id.toString(),
                        lastMsg: { 
                            _id: fullyNewMsg._id.toString(),
                            text: fullyNewMsg.text,
                            sender: { 
                                _id: fullyNewMsg.sender._id.toString(),
                                firstName: fullyNewMsg.sender.firstName,
                                lastName: fullyNewMsg.sender.lastName,
                                avatar: fullyNewMsg.sender.avatar
                            },
                            createdAt: fullyNewMsg.createdAt,
                        },
                        members: updatedConversation.members.map(m => ({ 
                            _id: m._id.toString(),
                            firstName: m.firstName,
                            lastName: m.lastName,
                            avatar: m.avatar
                        })),
                        isGroup: updatedConversation.isGroup,
                        chatName: updatedConversation.chatName || null,
                        groupType: updatedConversation.groupType || null, 
                        projectId: updatedConversation.projectId ? {
                            _id: updatedConversation.projectId._id.toString(),
                            name: updatedConversation.projectId.name,
                            avatarUrl: updatedConversation.projectId.avatarUrl
                        } : null,
                        teamId: updatedConversation.teamId ? {
                            _id: updatedConversation.teamId._id.toString(),
                            name: updatedConversation.teamId.name
                        } : null,
                        updatedAt: updatedConversation.updatedAt,
                        unreadCount: unreadCountForMember 
                    };

                    

                    io.to(`user:${memberId}`).emit("sidebar_conversation_update", { 
                        conversation: sidebarConvData,
                        senderId: sender.toString() 
                    });
                    console.log(`Backend: Emitted 'sidebar_conversation_update' to user:${memberId} for conv ${conversationId} with unreadCount: ${unreadCountForMember}`);
                    

                    

                    }


                  const onlyMembers = updatedConversation.members.filter(p=> p._id.toString() !== fullyNewMsg.sender._id.toString())

for (const member of onlyMembers) {
    const memberId = member._id.toString();

    const unreadChats = await Chat.find({
        sender:{$ne:memberId},
        readBy:{$nin:[memberId]}
    }).select("conversation")

    const convId = [...new Set(unreadChats.map(p=>p.conversation.toString()))]

    const conversations = await Conversation.find({
        _id:{$in:convId}
    }).populate({
        path: 'lastMsg',
        model: 'Chat',
        populate: {
            path: 'sender',
            model: 'User',
            select: '_id firstName lastName avatar'
        }
    })
    .populate("members", "_id firstName lastName avatar")
    .populate("projectId", "name avatarUrl")
    .populate("teamId", "name").sort({updatedAt:-1});

    let notifications = []

    for(let conv of conversations){
        // Calculate unread count for THIS specific member for THIS specific conversation
        const unreadCountForThisMember = await Chat.countDocuments({
            conversation: conv._id,
            sender: { $ne: memberId }, 
            readBy: { $nin: [memberId] } 
        });

        notifications.push({
            _id: conv._id.toString(),
            lastMsg: conv.lastMsg ? {
                _id: conv.lastMsg._id.toString(),
                text: conv.lastMsg.text,
                sender: typeof conv.lastMsg.sender === "object"
                    ? {
                        _id: conv.lastMsg.sender._id.toString(),
                        firstName: conv.lastMsg.sender.firstName,
                        lastName: conv.lastMsg.sender.lastName,
                        avatar: conv.lastMsg.sender.avatar
                    }
                    : {},
                createdAt: conv.lastMsg.createdAt,
            } : null,
            members: conv.members.map(m => ({
                _id: m._id.toString(),
                firstName: m.firstName,
                lastName: m.lastName,
                avatar: m.avatar
            })),
            isGroup: conv.isGroup,
            chatName: conv.chatName || null,
            groupType: conv.groupType || null,
            projectId: conv.projectId ? {
                _id: conv.projectId._id.toString(),
                name: conv.projectId.name,
                avatarUrl: conv.projectId.avatarUrl
            } : null,
            teamId: conv.teamId ? {
                _id: conv.teamId._id.toString(),
                name: conv.teamId.name
            } : null,
            updatedAt: conv.updatedAt,
            unreadCount: unreadCountForThisMember 
        });
    }

    io.to(`user:${memberId}`).emit("notifications_msg", { 
        notifications
    });
    
    console.log(`Backend: Emitted 'notifications_msg' to user:${memberId} with ${notifications.length} notifications`);
}
                    

                    

                   




                    

            } catch (error) {
                console.error("Backend: Error sending message:", error);
            }
        });



        socket.on("mark_as_read", async ({ conversationId, userId }) => {
            try {
                const unreadMessages = await Chat.find({
                    conversation: conversationId,
                    sender: { $ne: userId }, 
                    readBy: { $nin: [userId] } 
                });

                if (unreadMessages.length > 0) {
                    await Chat.updateMany(
                        { _id: { $in: unreadMessages.map(msg => msg._id) } },
                        { $addToSet: { readBy: userId } }
                    );
                    console.log(`Backend: User ${userId} marked ${unreadMessages.length} messages in conversation ${conversationId} as read.`);

                    io.to(conversationId).emit("read_message", {
                        conversationId: conversationId.toString(),
                        reader: { _id: userId.toString() }
                    });
                    console.log(`Backend: Emitted 'read_message' to room ${conversationId} for reader ${userId}`);

                    io.to(`user:${userId.toString()}`).emit("unread_count_cleared", {
                        conversationId: conversationId.toString()
                    });
                    console.log(`Backend: Emitted 'unread_count_cleared' to user:${userId} for conv ${conversationId}`);
                }

            } catch (error) {
                console.error("Backend: Error marking messages as read:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("Socket: User disconnected from socket", socket.id);
            
            if (socket.userId) {
                onlineUser.delete(socket.userId);
                console.log(`Backend: User ${socket.userId} went offline. Online users:`, Array.from(onlineUser));
                
                io.emit("online_users_updated", { onlineUsers: Array.from(onlineUser) });
            }
        });
    });
};