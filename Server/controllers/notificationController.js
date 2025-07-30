const Conversation = require("../models/Conversation")
const Chat = require("../models/Chat")
const Notification = require("../models/notification")



exports.sendMsgNotification = async (req,res)=>{


    try {


        const user = req.user
        
        const findUserConversations = await Conversation.find({members:{$in:user.id}})

        const unreadChat = await Chat.find({
            conversation: { $in: findUserConversations },
            sender: { $ne: user.id },
            readBy: { $nin: [user.id] }
        }).select("conversation")


        const convId = [...new Set(unreadChat.map(p=>p.conversation.toString()))]


        const conversations = await Conversation.find({_id:{

            $in:convId
        }}).populate("members", "_id firstName lastName avatar")
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


     let notifications = [];

  for (let conv of conversations) {
    const unreadCountForMember = await Chat.countDocuments({
      conversation: conv._id,
      sender: { $ne: user.id },
      readBy: { $nin: [user.id] }
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
      unreadCount: unreadCountForMember
    });
  }


  res.status(200).json({

    notifications
  })

        
    } catch (error) {

        console.log("can't fetch notificatuon due to this",error);
        res.status(500).json({

            success:false,
            message:"can't fetch message notififcation please try again"
        })
        
        
    }
}


exports.getNotifications = async(req,res)=>{


  try {

    const user = req.user

    const getAllNotifications = await Notification.find({
  assignedTo: { $in: [user.id] }
}).limit(5).sort({ createdAt: -1 });
    if(!getAllNotifications){

      return res.status(404).json({
        success:false,
        message:`No new notification for ${user.firstName}`
      })
    }

    res.status(200).json({
      success:true,
      notification:getAllNotifications
    })
    
  } catch (error) {
    console.log("can't get all notiifcations due to this",error);
    res.status(200).json({
      success:false,
      message:"can't get all notifications try again"
    })
    
  }
}