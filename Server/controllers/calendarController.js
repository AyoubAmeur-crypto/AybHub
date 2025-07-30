const mongoose = require("mongoose")
const express = require("express")
const Project = require("../models/Project")
const Team = require("../models/team")


exports.getTaskProjects = async (req,res)=> {



    try {

        const user = req.user

       

        if(user.role === 'manager'){

             const AssignedProjectOwner = await Project.find({entrepriseId:user.EntrepriseId})
        .populate({path:"tasks",select:"_id name status priority createdAt due"})

        if(!AssignedProjectOwner){

            return res.status(404).json({
                success:false,
                message:"Cannot find project for this user"
            })
        }

        return res.status(200).json({

            success:true,
            message:"fetched Project for this user within tasks",
            projects:AssignedProjectOwner
        })


            
        }
        const allTeams = await Team.find({$or:[
            {members:{$in:[user.id]}},
            {manager:user.id}
        ]})

        const allTeamId = allTeams.map(t => t._id)

         const AssignedProject = await Project.find({
            $or:[
                {members :{$in:[user.id.toString()]}},
                {manager:user.id},
                {teams:{$in:allTeamId}}
            ]
        })
        .populate({path:"tasks",select:"_id name status priority createdAt due"})

        if(!AssignedProject){

            return res.status(404).json({
                success:false,
                message:"Cannot find project for this user"
            })
        }

        return res.status(200).json({

            success:true,
            message:"fetched Project for this user within tasks",
            projects:AssignedProject
        })





        
    } catch (error) {

        console.log("can't fetch project with tasks due to this",error);

        res.status(500).json({

            success:false,
            message:"can't fetch project please try again"
        })
        
        
    }
}
