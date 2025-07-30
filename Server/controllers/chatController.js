const Conversation = require("../models/Conversation")
const Chat = require("../models/Chat")
const Project = require("../models/Project")
const User = require("../models/User")
const mongoose = require("mongoose")


exports.getAllConversations = async (req, res) => {
  try {
    const user = req.user;

    const otherUsers = await User.find({
      EntrepriseId: user.EntrepriseId,
      _id: { $ne: user.id }
    });

    // 2. For each user, check/create direct conversation
    for (const otherUser of otherUsers) {
      let conversation = await Conversation.findOne({
        isGroup: false,
        members: { $all: [user.id, otherUser._id] },
      });

      if (!conversation) {
        const uniqueMembers = Array.from(new Set([user.id.toString(), otherUser._id.toString()]));
        await Conversation.create({
          isGroup: false,
          members: uniqueMembers,
          entrepriseId: user.EntrepriseId
        });
      }
    }

   
     const allConversations = await Conversation.find({ entrepriseId: user.EntrepriseId,members:{$in:user.id} })
        .populate({ path: "lastMsg", select: "text", populate: [
          { path: "sender", select: "_id firstName lastName avatar" },
          { path: "readBy", select: "_id firstName lastName avatar" }
        ]})
        .populate("projectId", "name avatarUrl")
        .populate("teamId", "name")
        .sort({ updatedAt: -1 })
        .populate("members", "_id firstName lastName avatar").lean();


     
    

    if (!allConversations) {
      return res.status(404).json({
        success: false,
        messsage: "Can't found any conversation for this user"
      });
    }


     const conversationsWithUnreadCounts = await Promise.all(
      allConversations.map(async (conv) => {

        const unreadCount = await Chat.countDocuments({
          conversation: conv._id,
          sender: { $ne: user.id }, 
          readBy: { $nin: [user.id] } 
        });

        return {
          ...conv,
          unreadCount: unreadCount,
        };
      })
    );

    console.log("conversation sent there ",conversationsWithUnreadCounts);
    

    res.status(200).json({
      success: true,
      conversations: conversationsWithUnreadCounts
    });

  } catch (error) {
    console.log("can't fetch conversations due to this", error);
    res.status(500).json({
      success: false,
      message: "can't found conversation please try again"
    });
  }
};

exports.getAllAvailableMemebers = async (req,res)=>{


    try {  

        const user = req.user

        const getAllAvailableCompanyMemebers = await User.find({EntrepriseId:user.EntrepriseId,_id:{$ne:user.id}})

        if(!getAllAvailableCompanyMemebers){

            return res.status(404).json({

                success:false,
                message:"can't find any memebrs for this company"
            })
        }


        return res.status(200).json({

            success:true,
            availableMembers:getAllAvailableCompanyMemebers
        })



    } catch (error) {

        console.log("can't find members due to this",error);
        res.status(500).json({

            success:false,
            message:"can't find messages due to this"
        })
        
        
    }
}

exports.getAllMessageHistory = async (req,res)=>{

    try {

        const {conversationId}=req.body

        if(!mongoose.isValidObjectId(conversationId)){

            return res.status(400).json({

                sucess:false,
                message:"must be a valid conversationId"
            })
        }

        const getAllChat = await Chat.find({conversation:conversationId}).populate("sender","_id firstName lastName avatar").populate("readBy","_id firstName lastName avatar")

        if(!getAllChat){

            return res.status(404).json({

                success:false,
                message:"Chat not found"
            })
        }


        return res.status(200).json({

            success:true,
            chats:getAllChat
        })
        
    } catch (error) {


        console.log("can't found message history due to this",error);
        res.status(500).json({

            success:false,
            message:"can't found message history please try again"
        })
        
        
    }
}


exports.sendMessage = async (req,res)=>{


    try {

        const {text,conversationId}=req.body
        const user=req.user
        
        if(!mongoose.isValidObjectId(conversationId)){

            return res.status(400).json({

                success:false,
                message:"must have a valid destinationId"
            })
        }

        const newMessage = await Chat.create({text:text,sender:user.id,conversation:conversationId})


        const updatedConveration = await Conversation.findByIdAndUpdate(conversationId,{lastMsg:newMessage._id,updatedAt:new Date()})


        if(!updatedConveration){

           return  res.status(400).json({

                success:false,
                message:"can't found found conversation and updated it"
            })
        }

        const newUpdatedConversation = await Conversation.findOne({_id:conversationId}).populate({path:"lastMsg",select:"text",populate:[{
            path:"sender",select:"_id firstName lastName avatar"},
            {path:"readBy",select:"_id firstName lastName avatar"}]})


        




        res.status(200).json({
            success:true,
            message:"Message sent and conversation updated successfully",
            conversation:newUpdatedConversation
        })

        
    } catch (error) {


        console.log("can't send message due to this",error);
        res.status(500).json({

            success:false,
            message:"can't send message due to this "
        })
        
        
    }
}


exports.createGroupConversation  = async (req,res)=>{


    try {
        
        const { groupType, groupId, members, chatName } = req.body;

        if(!groupType.trim() || !['team','project'].includes(groupType)){

            return res.status(400).json({

                success:false,
                message:"groupType is misiing or invalid"
            })
        }

        if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Members array is required to create a group chat"
      });
    }


        if(!mongoose.isValidObjectId(groupId)){

            return res.status(400).json({

                success:false,
                message:"must have a valid groupId to continue"
            })
        }


        const checkConv = await Conversation.findOne({isGroup:true,
            groupType:groupType,
            ...(groupType === 'project' ? {projectId:groupId} : {teamId:groupId})
        }).populate("members", "_id firstName lastName avatar")
      .populate("projectId", "name avatarUrl")
      .populate("teamId", "name");

        if(checkConv){

            return res.status(200).json({

                success:true,
                conversation:checkConv
            })
        }


        const newConversationGroup = await Conversation.create({
            chatName:chatName,
            isGroup:true,
            members:members,
            groupType:groupType,
            ...(groupType === 'project' ? {projectId:groupId} : {teamId:groupId
            })
        })

        const sentNewConversation = await Conversation.findById(newConversationGroup._id)
      .populate("members", "_id firstName lastName avatar")
      .populate("projectId", "name avatarUrl")
      .populate("teamId", "name avatarUrl");



      res.status(201).json({

        success:true,
        conversation:sentNewConversation
      })




        
    }catch (error) {

        console.log("can't create conversation group due to this",error);

        res.status(500).json({

            success:false,
            message:"Can't create group conversaton please try again"
        })
        
        
    }
}


exports.readMessage = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const user = req.user;
    
    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "must have a valid conversationId"
      });
    }
    
    const conversationCheck = await Conversation.findById(conversationId).populate("members","_id");
    
    if (!conversationCheck) {
      return res.status(400).json({
        success: false,
        message: "conversation not exists"
      });
    }
    
    // Update ALL unread messages in this conversation (not just the last one)
    const updateResult = await Chat.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: user.id }, // Messages not sent by current user
        readBy: { $ne: user.id }   // Messages not already read by current user
      },
      {
        $addToSet: { readBy: user.id }
      }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} messages as read`);
    
    const io = req.app.get('io');
    
    if (io) {
      io.to(conversationId).emit("read_message", {
        conversationId,
        reader: {
          _id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar
        }
      });
    }

    if (conversationCheck.members && conversationCheck.members.length > 0) {
       
        conversationCheck.members.forEach(memberId => {
          if (memberId.toString() !== user.id.toString()) { // Don't send to the reader themselves again
          
            io.to(`user:${memberId.toString()}`).emit("read_message", {
              conversationId,
              reader: {
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar
              }
            });
          }
        });
      }
    
    
    res.status(200).json({
      success: true,
      message: "Messages marked as read successfully"
    });
    
  } catch (error) {
    console.log("can't update message read by due to this", error);
    res.status(500).json({
      success: false,
      message: "can't update message please try again"
    });
  }
};