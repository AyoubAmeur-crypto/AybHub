const mongoose = require("mongoose")
const Entreprise = require("../models/Entreprise")
const Team = require("../models/team")
const Invitation = require("../models/Invitation")
const Conversation = require("../models/Conversation")
const Task = require("../models/task")
const Project = require("../models/Project")
const User = require("../models/User")
const bcrypt = require("bcrypt")


exports.getMembersInfos = async (req,res)=>{


    try {

        const user = req.user


        const EntrepriseCheck = await Entreprise.findById(user.EntrepriseId)
        .populate({path:"workers.member", select:"_id firstName lastName avatar"})

        if(!EntrepriseCheck){

            return res.status(404).json({

                success:false,
                message:"can't find entreprise"
            })
        }


        return res.status(200).json({

            success:true,
            entreprise:EntrepriseCheck
        })




    } catch (error) {
        
        console.log("cant find entreprise due to this",error);

        res.status(500).json({

            success:false,
            message:"can't find entreprise please try again"
        })
        
    }
}

exports.getTeams = async (req,res)=>{

    try {
        const user = req.user

        const availabeTeams = await Team.find({entrepriseId:user.EntrepriseId})
        .populate({path:"members",select:"_id firstName lastName avatar"})
        .populate({path:"manager",select:"_id firstName lastName avatar"}).sort({createdAt:-1})

        if(!availabeTeams || !Array.isArray(availabeTeams) || availabeTeams.length===0){

            return res.status(404).json({
                success:false,
                message:"can't find teams in this entreprise"
            })
        }

        res.status(200).json({

            success:true,
            message:"available teams in this entreprise",
            teams:availabeTeams
        })
        
    } catch (error) {

        console.log("can't feth availabe teams in this entreprise due to this",error);
        res.status(500).json({
            success:false,
            message:"can't feth availabe teams in this entreprise please try again"
        })
        
        
    }
}


exports.getInvitations = async (req,res)=>{


    try {

        const user = req.user

        const allInvitations = await Invitation.find({entreprise:user.EntrepriseId}).sort({createdAt:-1}).limit(10)


        if(!allInvitations){

            return res.status(404).json({

                success:false,
                message:"can't find invitations for this entreprise"
            })
        }

        

        res.status(200).json({

            success:true,
            message:"Invitations sent",
            invitations:allInvitations
        })
        
    } catch (error) {

        console.log("can't find invitations due to this",error);
        res.status(500).json({

            success:false,
            message:"can't find invations please try again!"
        })
        
        
    }
}


exports.removeFromTeam = async (req,res)=>{

    try {

        const {deletedId} = req.params
        const user = req.user
        console.log("check the deletedId sent ",deletedId,deletedId.length,typeof deletedId);
        
        if(!mongoose.isValidObjectId(deletedId)){

            return res.status(400).json({

                success:false,
                message:"must have a valid Id"
            })
        }


        await User.findByIdAndUpdate(deletedId,{$unset:{EntrepriseId:""}},{new:true})

        await Invitation.deleteOne({user:deletedId})

        const deleteFromEntreprise = await Entreprise.findByIdAndUpdate(user.EntrepriseId,{$pull:{workers:{member:deletedId}}},{new:true})

        const deleteConversation = await Conversation.deleteMany({entrepriseId:user.EntrepriseId,isGroup:false,projectId:null,teamId:null,members:{$in:[deletedId]}})
        const deleteFromTeam = await Team.updateMany({entrepriseId:user.EntrepriseId,$or:[
          {members:{$in:[deletedId]}},
          {manager:deletedId}
        ]},{ $pull: { members: deletedId },
    $unset: { manager: deletedId } })

    const deleteFromTask = await Task.updateMany({entrepriseId:user.EntrepriseId,$or:[
          {assignedTo:{$in:[deletedId]}},
          {CreatedBy:deletedId}
        ]},{ $pull: { assignedTo: deletedId },
    $unset: { CreatedBy: deletedId } })
       const deleteFromProject = await Project.updateMany({entrepriseId:user.EntrepriseId,$or:[
          {members:{$in:[deletedId]}},
          {manager:deletedId}
        ]},{ $pull: { members: deletedId },
    $unset: { manager: deletedId } })



    if(deleteConversation && deleteFromEntreprise && deleteFromTask && deleteFromProject && deleteFromTeam){

        return res.status(200).json({

            success:true,
            message:"Congrats User Has Been deleted Successfully."
        })



    }
        
    } catch (error) {

        console.log("can't delete this member due to this",error);
        res.status(500).json({

            success:false,
            message:"can't delete this member try again!"
        })
        
        
    }
}

exports.deleteForEver = async (req,res)=>{

    try {

        const user = req.user

        const deleteForEver = await User.findByIdAndDelete(user.id)
        const deleteInvitation =   await Invitation.deleteOne({user:user.id})
         const deleteConversation = await Conversation.deleteMany({entrepriseId:user.EntrepriseId,isGroup:false,projectId:null,teamId:null,members:{$in:[user.id]}})
        const deleteFromTeam = await Team.updateMany({entrepriseId:user.EntrepriseId,$or:[
          {members:{$in:[user.id]}},
          {manager:user.id}
        ]},{ $pull: { members: user.id },
    $unset: { manager: user.id } })

    const deleteFromEntreprise = await Entreprise.findByIdAndUpdate(user.EntrepriseId,{
        $pull:{workers:{member:user.id}}
    },{new:true})

    const deleteFromTask = await Task.updateMany({entrepriseId:user.EntrepriseId,$or:[
          {assignedTo:{$in:[user.id]}},
          {CreatedBy:user.id}
        ]},{ $pull: { assignedTo: user.id },
    $unset: { CreatedBy: user.id } })
       const deleteFromProject = await Project.updateMany({entrepriseId:user.EntrepriseId,$or:[
          {members:{$in:[user.id]}},
          {manager:user.id}
        ]},{ $pull: { members: user.id },
    $unset: { manager: user.id } })


        if(!deleteForEver){

            return res.status(404).json({
                success:false,
                message:"user not found"
            })
        }

        if(deleteForEver && deleteFromEntreprise && deleteInvitation && deleteConversation && deleteFromTeam && deleteFromTask && deleteFromProject){

                 return res.status(200).json({
            success:true,
            message:"User has Been Deleted Entriely from AYB HUB 🫡🫡"
        })

        }

   
        
    } catch (error) {

        console.log("can't delete this user sue to this",error);
        res.status(500).json({
            success:false,
            message:"can't delete user entirely please try again later!"
        })
        
        
        
    }
}


exports.changePassowrd = async (req,res)=>{


    try {

        const user = req.user
        const {oldPassword,NewPassword}=req.body

        const fullUser = await User.findById(user.id).select("password")
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


        if(!fullUser){

            return res.status(404).json({

                success:false,
                message:"can't find user due to this"
            })
        }

        const checkPassword =await bcrypt.compare(oldPassword,fullUser.password)

        if(!checkPassword){

            return res.status(400).json({
                success:false,
                message:"Password Incorrect"
            })
        }

        if(oldPassword.trim() === NewPassword.trim()){

            return res.status(400).json({

                success:false,
                message:"You Can't Set The Same Password! Try Another One"
            })
        }

        if(!strongPasswordRegex.test(NewPassword)){

            return res.status(400).json({

                success:false,
                message:"Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
            })
        }

        const salt= await bcrypt.genSalt()
        const hashNewPassword = await bcrypt.hash(NewPassword,salt)

        await User.findByIdAndUpdate(user.id,{password:hashNewPassword},{new:true})

        res.status(200).json({
            success:true,
            message:"Password Has Been Changed Successfuly"
        })




        
    } catch (error) {

        console.log("can't update password due to this",error);
        res.status(500).json({

            success:false,
            message:"Can't update password for the moment please try again!"
        })
        
        
    }
}


exports.getExactInfos = async (req,res)=>{


    try {
        const user = req.user

        const getInfosUser = await Invitation.findOne({status:'accepted',user:user.id})

        if(!getInfosUser){

            return res.status(404).json({

                success:false,
                message:"Can't find this user please try again"
            })
        }

        res.status(200).json({

            success:true,
            info:getInfosUser
        })
    } catch (error) {

        console.log("can't find this user due to this",error);

        res.status(500).json({
            success:false,
            message:"can't get user exact infos please try again later!"
        })
        
        
    }
}