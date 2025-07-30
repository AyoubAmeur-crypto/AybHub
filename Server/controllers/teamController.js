
const Team = require("../models/team")
const mongoose = require('mongoose')
const Conversation = require("../models/Conversation")
const Entreprise = require("../models/Entreprise")
const Notification = require("../models/notification")

exports.createTeam = async(req,res)=>{

try {

    const {name,description,members,manager}=req.body
    const user = req.user
    const io = req.io
    const checkEntreprise = await Entreprise.findById(user.EntrepriseId)


    if(!name || !description || !Array.isArray(members) || members.length===0 || !mongoose.isValidObjectId(manager) || !mongoose.isValidObjectId(checkEntreprise._id)){





        return res.status(400).json({

            success:false,
            message:"data validation error!"
        })
    }



    const newTeam = await Team.create({

        name:name,
        description:description,
        members:members,
        manager:manager,
        entrepriseId:checkEntreprise._id

    })



    const allMembers = Array.from(new Set([...newTeam.members,newTeam.manager.toString(),checkEntreprise.owner.toString()]))
    const NotificationMembers = allMembers.filter(m => m !== user.id.toString())

    if(newTeam){

         const checkConv = await Conversation.findOne({
        
                    isGroup:true,
                    groupType:'team',
                    teamId:newTeam._id
                })
        
                if(!checkConv){
        
                    await Conversation.create({
        
                        isGroup:true,
                        chatName:newTeam.name,
                        members:allMembers,
                        groupType:'team',
                        teamId:newTeam._id,
                        entrepriseId: user.EntrepriseId
        
                    })
                }

               await Notification.create({
  name: 'Team Assignment',
  content: `You have been added to the team "${newTeam.name}"`,
  assignedTo: NotificationMembers
});

for (let member of NotificationMembers) {
  io.to(`user:${member}`).emit('notifications_update', {
    name: 'Team Assignment',
    content: `You have been added to the team "${newTeam.name}"`,
    memberId: member
  });
}

        return res.status(201).json({

            suceess:true,
            messsage:"team created successfuly",
            team:newTeam
        })
    }
    
} catch (error) {


    console.log("can't create team due to this",error);

    res.status(500).json({

        success:false,
        message:"can't create team please try again!"
    })
    
    
}

}


exports.fetchTeams = async (req,res)=>{

    try {

        const user = req.user
        const checkEntreprise = await Entreprise.findById(user.EntrepriseId)
        if(!checkEntreprise){
            return res.status(404).json({

                succes:false,
                message:"Can't find entreprise please try again"
            })
        }


        if(user.role === 'manager'){

            const allTeams = await Team.find({entrepriseId:checkEntreprise._id}).populate("members manager")

            if(!Array.isArray(allTeams) || allTeams.length === 0){

                return res.status(404).json({

                    success:false,
                    message:"Can't find teams for this user please try Again"
                })
            }

            return res.status(200).json({

                success:true,
                message:"Fetched teams for this user",
                teams:allTeams
            })


        }


        const availabeTeams = await Team.find({$or:[
            {members:{$in:[user.id]}},
            {manager:user.id}
        ]}).populate("members manager")

        if(!Array.isArray(availabeTeams) || availabeTeams.length === 0){

                return res.status(404).json({

                    success:false,
                    message:"Can't find teams for this user please try Again"
                })
            }

            res.status(200).json({

                success:true,
                message:"Fetched teams for this user",
                teams:availabeTeams
            })
        
    } catch (error) {

         console.log("can't fetch teams due to this",error);

    res.status(500).json({

        success:false,
        message:"can't fetch team please try again!"
    })
        
    }
}



exports.deleteTeam = async (req,res)=>{


    try {

        const {teamId} = req.params
        const io = req.io

        if(!mongoose.isValidObjectId(teamId)){

            return res.status(400).json({

                success:false,
                message:"Must have a valid teamId"
            })
        }
        const findTeam = await Team.findById(teamId)

        if(!findTeam){

            return res.status(404).json({
                success:false,
                message:"can't find the team!"
            })
        }

        await Team.findByIdAndDelete(findTeam._id)

        const checkConv = await Conversation.deleteMany({ teamId: findTeam._id })

        if(!checkConv){


            return res.status(404).json({

                success:false,
                message:"can't delete conversation it's not found or smtg else"
            })
            
        }

        const allNotified = Array.from(new Set([...findTeam.members.map(m => m && m.toString()),findTeam.manager.toString()]))

        await Notification.create({
  name: 'Team Deleted',
  content: `Team "${findTeam.name}" has been deleted.`,
  assignedTo: allNotified
});

for (let member of allNotified) {
  io.to(`user:${member}`).emit('notifications_update', {
    name: 'Team Deleted',
    content: `Team "${findTeam.name}" has been deleted.`,
    memberId: member
  });
}

        res.status(200).json({
            success:true,
            message:"team deleted successfuly"
        })
        
    } catch (error) {

        console.log("can't delete team due to this",error);
        res.status(500).json({

            success:false,
            message:"can't delete team please try again"
        })
        
        
    }
}


exports.updateTeam = async (req,res)=>{

    try {

        const {teamId}=req.params
        const {Data}=req.body
        const user = req.user
        const io = req.io

        console.log("data sent from fornt end ",Data);
        



        if(!mongoose.isValidObjectId(teamId)){

            return res.status(400).json({

                success:false,
                message:"must have a valid teamId"
            })
        }

        const updatedTeam = await Team.findByIdAndUpdate(teamId,{$set:Data},{new:true})
        const checkEntreprise = await Entreprise.findById(user.EntrepriseId)
        const AllMembersForConversation = Array.from(new Set([...updatedTeam.members,updatedTeam.manager,checkEntreprise.owner]))
        await Conversation.findOneAndUpdate({teamId:updatedTeam._id},{members:AllMembersForConversation})

        console.log("updated Team check",updatedTeam);
                const allNotified = Array.from(new Set([...updatedTeam.members.map(m => m.toString()),updatedTeam.manager.toString()]))

        await Notification.create({
  name: 'Team Update',
  content: `Team "${updatedTeam.name}" has been updated.`,
  assignedTo: allNotified
});

for (let member of updatedTeam.members) {
  io.to(`user:${member}`).emit('notifications_update', {
    name: 'Team Update',
    content: `Team "${updatedTeam.name}" has been updated.`,
    memberId: allNotified
  });
}

        res.status(200).json({
            success:true,
            message:"Team updated successfully"
        })
        
    } catch (error) {

        console.log("can't update the team due to this",error);
        res.status(500).json({
            success:false,
            message:"can't update the team please try again"
        })
        
        
    }
}