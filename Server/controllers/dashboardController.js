const Entreprise = require("../models/Entreprise");
const Project = require("../models/Project")
const Notification = require("../models/notification")
const Team = require("../models/team")
const Task = require("../models/task")
exports.logout = async (req,res) => {


    try {

       res.clearCookie('token', { path: '/',
        sameSite: 'lax',
        secure: false,
        });

        res.status(200).json({
            message:"Logout successfully"
        })
        
    } catch (error) {

        console.log("Can't logout due to this",error);
        res.status(500).send("Internal server error")
        
        
    }
}


exports.getRecentProjects = async (req,res)=>{


    try {

        const user = req.user

        if(user.role === 'manager'){

            const allProjects = await Project.find({entrepriseId:user.EntrepriseId})
            .populate({path:"tasks",select:"_id name status due"})
            .populate({path:"teams",select:"_id name"}).limit(3).sort({createdAt:-1})

            if(!allProjects){

                return res.status(404).json({
                    success:false,
                    message:"No Project assigned to this user"
                })
            }


            return res.status(200).json({

                success:true,
                message:"Available projects , teams and tasks",
                projects:allProjects
            })

            
        }

        const userTeam = await Team.find({$or:[
            {members:{$in:[user.id]}},
            {manager:user.id}
        ]})

        const teamId = userTeam.map(t => t._id)


        const assignedProjects = await Project.find({$or:[
            {members:{$in:[user.id]}},
            {manager:user.id},
            {teams:{$in:teamId}}
        ]}).populate({path:"tasks",select:"_id name status due"})
           .populate({path:"teams",select:"_id name"})
           .limit(3).sort({createdAt:-1}).limit(3).sort({createdAt:-1})

        if(!assignedProjects){

            return res.status(404).json({
                    success:false,
                    message:"No Project assigned to this user"
                })
        }

         res.status(200).json({

                success:true,
                message:"Available projects , teams and tasks",
                projects:assignedProjects
            })
        
    } catch (error) {

        console.log("can't fetch projects due to this",error);
        res.status(500).json({

            success:false,
            message:"caan't fetch projects please try again"
        })
        
        
    }
}


exports.getTeamInfos = async (req,res)=>{

    try {

        const user = req.user

        if(user.role==='manager'){

            const entrepriseCheck = await Entreprise.findById(user.EntrepriseId)

            if(!entrepriseCheck){

                return res.status(404).json({
                    success:false,
                    message:"cant find entreprise for this user"
                })
            }

            const allTeams = await Team.find({entrepriseId:entrepriseCheck._id})

            if(!allTeams){


                return res.status(404).json({
                    success:false,
                    message:"can't find teams for this user",
                })}


              return res.status(200).json({

                success:true,
                teams:allTeams
            })



          

        }

        const assignedTeams = await Team.find({

            $or:[
                {members:{$in:[user.id]}},
                {manager:user.id}
            ]
        })

        if(!assignedTeams){

            return res.status(404).json({
                    success:false,
                    message:"can't find teams for this user",
                })
        }

        console.log("assigned teams ",assignedTeams);
        

        res.status(200).json({

                success:true,
                teams:assignedTeams
            })
        
    } catch (error) {


         console.log("can't fetch teams due to this",error);
        res.status(500).json({

            success:false,
            message:"caan't fetch teams please try again"
        })
        
    }
}

exports.getInfos = async (req,res)=>{

    try {

        const user = req.user

        if(user.role === 'manager'){

            const allProjects = await Project.find({entrepriseId:user.EntrepriseId})
            .populate({path:"tasks",select:"_id name status due"})
            .populate({path:"teams",select:"_id name"})

            if(!allProjects){

                return res.status(404).json({
                    success:false,
                    message:"No Project assigned to this user"
                })
            }


            return res.status(200).json({

                success:true,
                message:"Available projects , teams and tasks",
                projects:allProjects
            })

            
        }

        const attachedTeams = await Team.find({$or:[
            {members:{$in:[user.id]}},
            {manager:user.id}
        ]})


        const teamsId = attachedTeams.map(t => t._id.toString())
        const assignedProjects = await Project.find({$or:[
            {members:{$in:[user.id]}},
            {manager:user.id},
            {teams:{$in:teamsId}}
        ]}).populate({path:"tasks",select:"_id name status due"})
            .populate({path:"teams",select:"_id name"})


        if(!assignedProjects){

            return res.status(404).json({
                    success:false,
                    message:"No Project assigned to this user"
                })
        }

         res.status(200).json({

                success:true,
                message:"Available projects , teams and tasks",
                projects:assignedProjects
            })




        
    } catch (error) {

        console.log("can't fetch available projects, tasks and teams due to this",error);

        res.status(500).json({

            success:false,
            message:"Can't get projects , teams and tasks please try again!"
        })
        
        
    }
}

exports.TaskInfo = async (req,res)=>{


    try {
        const user = req.user
         const attachedTeams = await Team.find({
      $or: [
        { members: { $in: [user.id] } },
        { manager: user.id }
      ]
    });
    const teamsId = attachedTeams.map(t => t._id.toString());

    // Get all projects where user is manager, member, or via team
    const projects = await Project.find({
      $or: [
        { members: { $in: [user.id] } },
        { manager: user.id },
        { teams: { $in: teamsId } }
      ]
    });

    let allTasks = [];

    for (const project of projects) {
      if (project.manager.toString() === user.id.toString()) {
        const projectTasks = await Task.find({ project: project._id });
        allTasks = allTasks.concat(projectTasks);
      } else {
        const filteredTasks = await Task.find({
          project: project._id,
          $or: [
            { assignedTo: { $in: [user.id] } },
            { team: { $in: teamsId } }
          ]
        });
        allTasks = allTasks.concat(filteredTasks);
      }
    }

    const uniqueTasks = [];
    const seen = new Set();
    for (const task of allTasks) {
      if (!seen.has(task._id.toString())) {
        uniqueTasks.push(task);
        seen.add(task._id.toString());
      }
    }

    res.status(200).json({
      success: true,
      tasks: uniqueTasks
    });


        
    } catch (error) {
        console.log("can't fetch taks due to this",error);
        res.status(500).json({

            success:false,
            message:"can't find tasks please try again!"
        })
        
    }
}

exports.getCalendarInfos = async (req,res)=> {



    try {

        const user = req.user

       

        if(user.role === 'manager'){

             const AssignedProjectOwner = await Project.find({entrepriseId:user.EntrepriseId})
        .populate({path:"tasks",select:"_id name status priority createdAt due"}).limit(4).sort({createdAt:-1})

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

        const teamId = allTeams.map(t => t._id)

         const AssignedProject = await Project.find({
            $or:[
                {members :{$in:[user.id.toString()]}},
                {manager:user.id},
                {teams:{$in:teamId}}
            ]
        })
        .populate({path:"tasks",select:"_id name status priority createdAt due"}).limit(4).sort({createdAt:-1})

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

exports.getDashboardNotifications = async(req,res)=>{


  try {

    const user = req.user

    const getAllNotifications = await Notification.find({
  assignedTo: { $in: [user.id] }
}).limit(4).sort({ createdAt: -1 });
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