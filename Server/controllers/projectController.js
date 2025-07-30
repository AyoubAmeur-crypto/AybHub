const Project = require("../models/Project")
const User = require("../models/User");
const Team = require("../models/team")
const Task = require("../models/task")
const mongoose = require("mongoose");
const task = require("../models/task");
const Comment = require("../models/Comment");
const Conversation = require("../models/Conversation");
const Entreprise = require("../models/Entreprise");
const Notification = require("../models/notification");

exports.uploadProjectAvatar = (req, res) => {
 try {

     if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.status(200).json({ url: req.file.path }); 
    
 } catch (error) {

    res.status(500).json({
        message:"Error Uploading Porject Avatar Picture Please Try Again"
    })
    console.log("can't upload avatar project picture due to this",error);
    
    
 }
};
exports.downloadFile = async (req, res) => {
  try {
    const { cloudinaryId, filename } = req.params;
    
    
    // Construct the full Cloudinary URL with folder path
    const fileUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/project-attachments/${cloudinaryId}`;
    
    
    // Set proper headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Proxy the file from Cloudinary to client
    const https = require('https');
    const request = https.get(fileUrl, (cloudinaryResponse) => {
      
      if (cloudinaryResponse.statusCode === 200) {
        cloudinaryResponse.pipe(res);
      } else {
        console.log('File not found on Cloudinary');
        res.status(404).json({ error: 'File not found' });
      }
    });
    
    request.on('error', (error) => {
      console.error('HTTPS request error:', error);
      res.status(500).json({ error: 'Download failed' });
    });
    
  } catch (error) {
    console.error('Download controller error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
};
exports.getSecureDownload = async (req, res) => {
  try {
    const { cloudinaryId, filename, resourceType = 'raw' } = req.body;
    
    if (!cloudinaryId || !filename) {
      return res.status(400).json({ error: 'Cloudinary ID and filename are required' });
    }

    // For PDFs and ZIPs, we need to use Cloudinary's delivery options
    const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`;
    
    // Create download URL with proper flags
    const downloadUrl = `${baseUrl}/raw/upload/fl_attachment:${encodeURIComponent(filename)}/${cloudinaryId}`;
    
    
    res.status(200).json({
      downloadUrl: downloadUrl,
      filename: filename
    });

  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ 
      error: 'Failed to generate download URL',
      details: error.message 
    });
  }
};
exports.uploadAttachements = (req, res) => {


     
    
    try {
        if (!req.files || req.files.length === 0) {
            console.log("ERROR: No files in controller");
            return res.status(400).json({ error: 'No files uploaded' });
        }

        
        const attachments = [];
        
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            
           
            
            if (!file.path) {
                throw new Error(`File ${i + 1} (${file.originalname}): Cloudinary upload failed`);
            }
            
            // FIX: Extract clean cloudinary ID from the filename
            let cleanCloudinaryId = file.filename;
            if (file.filename.includes('/')) {
                // If filename contains folder path, extract just the ID
                cleanCloudinaryId = file.filename.split('/').pop();
            }
            
            
            attachments.push({
                url: file.path,
                filename: file.originalname,
                cloudinaryId: cleanCloudinaryId, // Store only the clean ID
                size: file.size || 0,
                type: file.mimetype,
                uploadedAt: new Date().toISOString()
            });
        }

      

        res.status(200).json({
            message: 'Attachments uploaded successfully',
            attachments: attachments,
            count: attachments.length
        });

    } catch (error) {
        console.error("=== CONTROLLER ERROR ===");
        console.error("Error:", error.message);
        console.error("Stack:", error.stack);
        
        res.status(500).json({
            error: "Error processing attachments",
            details: error.message
        });
    }
}

exports.addProject = async (req,res)=>{


    try {

        const {name,description,avatarUrl,attachments,teams,members,dueDate,visibility,manager,status} = req.body

        const user = req.user
        const io = req.io

        
        if(!name || !description || !visibility || !manager || !status) {

            return res.status(400).json({
                message: 'Please provide all required fields: name, description, status, visibility, and manager.'
            });
        }
        
        const managerDetails = await User.findById(manager)

         const project = new Project({
            name: name,
            description: description,
            avatarUrl: avatarUrl || '',
            attachments: attachments || [], // FIX: Changed from attachements to attachments
            teams: teams || [],
            members: members || [],
            dueDate: dueDate || Date.now(),
            visibility: visibility,
            manager: manager,
            status: status || 'Planning',
            entrepriseId:managerDetails.EntrepriseId
        })


        await project.save()
        const detailedProject = await Project.findById(project._id)
        .populate({path:'teams',select:'_id name description members manager', populate:[{path:'manager',select:'_id firstName lastName avatar'},{path:'members',select:'_id firstName lastName avatar'}]})
        const getEntrepriseDetails = await Entreprise.findById(user.EntrepriseId)
         const teamMembers = detailedProject.teams.flatMap(t => {

            const allTeamMembers = Array.isArray(t.members) ? t.members.map(t => t._id ? t._id.toString() : t.toString()) : []
            const teamManager =  t.manager ? (t.manager._id ? t.manager._id.toString() : t.manager.toString()) : null

            return [...allTeamMembers,teamManager]


        })
        const allMembers = Array.from(new Set([...project.members, project.manager.toString(),getEntrepriseDetails.owner.toString(),...teamMembers]));

        const allMembersNotf = Array.from(new Set([...project.members, project.manager.toString(),...teamMembers]));


        const checkConv = await Conversation.findOne({

            isGroup:true,
            groupType:'project',
            projectId:project._id
        })

        if(!checkConv){

            await Conversation.create({

                isGroup:true,
                chatName:project.name,
                members:allMembers,
                groupType:'project',
                projectId:project._id,
                entrepriseId: user.EntrepriseId

            })
        }

        const notification = await Notification.create({
                name: 'Project Assignment',
            content:`You Are Assigned To Work in ${project.name}`,
            assignedTo:allMembersNotf
        })


        if(notification){


            for(let member of allMembersNotf){

                io.to(`user:${member}`).emit('notifications_update',{
                      

                    name: 'Project Assignment',
                    content:`You Are Assigned To Work in ${project.name}`,
                    memberId:member
                })
            }
        }

        

        

        res.status(201).json({message:"Project Created Successfuly"})


        
    } catch (error) {

        console.log("Can't create a project due to this",error);
        res.status(500).json({message:"Can't create Project try again please"})
        
    }
}

exports.filtredProjects = async (req,res)=>{

      try {

        const {filters,sort}=req.body
       
        const {search}=req.query
        

        const user = req.user
          if(!user){

            return res.status(404).json({
                message:"User not found"
            })
        }
         let filterdQuery={}
        filterdQuery={
            entrepriseId:user.EntrepriseId
        }

        if(search && search.trim() !== ""){

                filterdQuery.name = { $regex: search, $options: "i" };

            }

        if(filters.status && filters.status.length > 0){

            filterdQuery.status={$in:filters.status}
        }

        if(filters.visibility && filters.visibility.length>0){

            filterdQuery.visibility={$in:filters.visibility}
        }



        let sortQuery={}

        if(sort){

          const [field,order]=sort.split("-")
          sortQuery[field]=order === "asc" ? 1 : -1

        }else{

            sortQuery.createdAt = 1
        }
;
        
        

    


       
        
        if(user.role === 'manager'){
                
            const projectsArray = await Project.find(filterdQuery).populate([
                    { path: 'teams', select: 'name description' , populate:[{ path: 'manager', select: '_id firstName lastName avatar' },
                    { path: 'members', select: '_id firstName lastName avatar' }] },
                    
                ]).populate({path:'members',select:'firstName lastName avatar'}).populate({path:'tasks' ,select:'name status'}).sort(sortQuery).limit(20)
        if(!projectsArray){
            return res.status(404).json({message:'No projects founded'})
        }

        
        return res.status(200).json({
            projects:projectsArray || []
        })

       

        }

        if(user.role === 'worker'){
            const projects = await Project.find(filterdQuery)
                .populate([
                    { path: 'teams', select: 'name members manager description', populate:[
                        { path: 'manager', select: '_id firstName lastName avatar' },
                        { path: 'members', select: '_id firstName lastName avatar' }
                    ]},
                    
                ]).populate({path:'members',select:'_id firstName lastName avatar'}).populate({path:'tasks' ,select:'name status'}).populate({path:'manager' , select:'_id firstName lastName avatar'}).sort(sortQuery).limit(20)

      
         const filtredProject = projects.filter(project => {
    const isMember = Array.isArray(project.members) && project.members.some(
        member =>  member._id.toString() === user.id.toString()
    );
    const isManager = project.manager && project.manager._id && project.manager._id.toString() === user.id.toString();
    const isInTeam = Array.isArray(project.teams) && project.teams.some(team => {
        const memberMatch = Array.isArray(team.members) && team.members.some(
            member =>  member._id.toString() === user.id.toString()
        );
        const managerMatch = team.manager && team.manager._id && team.manager._id.toString() === user.id.toString();
        return memberMatch || managerMatch;
    });

    return isMember || isManager || isInTeam;
});
        

        

        return res.status(200).json({
            projects:filtredProject
        })
    
    
    
    }

        
        
    } catch (error) {

        console.log("Can't find any projects due to this",error);
        res.status(500).json({message:"Can't find any projects please try again"})
        
        
    }
}
exports.projects = async (req,res)=>{


    try {

        const {ownerId}=req.body
        const user = await User.findById(ownerId)
        
        if(!ownerId){

            return res.status(400).json({
                message:"Id is neccessary to identify your project workflow!"
            })
        }
        if(!user){

            return res.status(404).json({
                message:"User not found"
            })
        }

       
        
        if(user.role === 'manager'){
                
            const projectsArray = await Project.find({entrepriseId:user.EntrepriseId}).populate([
                    { path: 'teams', select: 'name description' , populate:[{ path: 'manager', select: '_id firstName lastName avatar' },
                    { path: 'members', select: '_id firstName lastName avatar' }] },
                    
                ]).populate({path:'members',select:'firstName lastName avatar'}).populate({path:'manager' , select:'_id firstName lastName avatar'}).populate({path:'tasks' ,select:'name status'})
        if(!projectsArray){
            return res.status(404).json({message:'No projects founded'})
        }

        
        return res.status(200).json(projectsArray)

       

        }

        if(user.role === 'worker'){
            const projects = await Project.find({entrepriseId:user.EntrepriseId})
                .populate([
                    { path: 'teams', select: 'name description' , populate:[{ path: 'manager', select: '_id firstName lastName avatar' },
                    { path: 'members', select: '_id firstName lastName avatar' }] },
                    
                ]).populate('members' ,'_id firstName lastName avatar').populate('manager','_id firstName lastName avatar').populate('tasks','name status')

        const filtredProject = projects.filter(project => {
    const isMember = Array.isArray(project.members) && project.members.some(
        member =>  member._id.toString() === user._id.toString()
    );
    const isManager = project.manager && project.manager._id && project.manager._id.toString() === user._id.toString();
    const isInTeam = Array.isArray(project.teams) && project.teams.some(team => {
        const memberMatch = Array.isArray(team.members) && team.members.some(
            member =>  member._id.toString() === user._id.toString()
        );
        const managerMatch = team.manager && team.manager._id && team.manager._id.toString() === user._id.toString();
        return memberMatch || managerMatch;
    });

    return isMember || isManager || isInTeam;
});

        if(!filtredProject){

            return res.status(404).json({

                message:"No projects found for you"
            })
        }


        return res.status(200).json(filtredProject)
    
    
    
    }

        
        
    } catch (error) {

        console.log("Can't find any projects due to this",error);
        res.status(500).json({message:"Can't find any projects pease try again"})
        
        
    }
}

exports.project = async (req,res)=>{


    try {

        const {id} = req.params
        const focusedProject = await Project.findById(id)
        .populate('manager','_id firstName lastName email avatar')
        .populate('members','_id firstName lastName email avatar')
        .populate({path:'teams',select:'_id name description',populate:{path:'members',select:'_id firstName lastName email avatar'}})
        .populate('tasks', '_id status name')
        .populate({path:'entrepriseId',
            populate:{
            path:'owner',
            select:'_id firstName lastName email avatar'

        }})


        if(!focusedProject){

            return res.status(404).json({message:"Project not founded"})
        }

        res.status(200).json(focusedProject)
        
    } catch (error) {

         console.log("Can't find this project due to this",error);
        res.status(500).json({message:"Can't find the Project try again please"})

        
    }
}


exports.updateProject = async (req,res)=>{


    try {

        const {id} = req.params
        const io = req.io
        const user = req.user
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({message:"Enter a valide id"})
        }
        
        const updatedFields={}
        const filedsKey = ["name","description","avatarUrl","attachments","teams","members","dueDate","visibility","manager","status"]

        filedsKey.map((item)=> {
            if(req.body[item] !== undefined){
                updatedFields[item]=req.body[item]
            }
        })

        
        const hasProjectChanges = req.body.hasProjectChanges === true;
        
        console.log('Backend received:', {
            updatedFieldsCount: Object.keys(updatedFields).length,
            hasProjectChanges: hasProjectChanges,
            receivedHasProjectChanges: req.body.hasProjectChanges
        });

        if(Object.keys(updatedFields).length === 0 && !hasProjectChanges){
            return res.status(400).json({message:'You need to update at least one field!'})
        } 

        if(Object.keys(updatedFields).length === 0 && hasProjectChanges){
            const project = await Project.findById(id)
                .populate('manager','_id firstName lastName email avatar')
                .populate('members','_id firstName lastName email avatar')
                .populate({path:'teams',select:'_id name',populate:{path:'members',select:'_id firstName lastName email avatar'}})
                .populate('tasks', '_id status name')
                .populate('entrepriseId',{populate:{path:'owner',select:'_id firstName lastName email avatar'}});
                
            return res.status(200).json({
                message:'Project updated successfully',
                project: project
            })
        }

        const UpdatedOne = await Project.findByIdAndUpdate(id,{$set:updatedFields},{new:true})
            .populate('manager','_id firstName lastName email avatar')
            .populate('members','_id firstName lastName email avatar')
            .populate({path:'teams',select:'_id name members manager',populate:[{path:'members',select:'_id firstName lastName email avatar'},{path:'manager',select:'_id firstName lastName email avatar'}]},
                
            )
            .populate('tasks', '_id status name')
            .populate({
                path: 'entrepriseId',
                populate: {
                    path: 'owner',
                    select: '_id firstName lastName email avatar'
                }
            });

        if(!UpdatedOne){
            return res.status(404).json({message:"Project Not Found"})
        }

        const memberIds = UpdatedOne.members
  .filter(m => m && m._id)
  .map(m => m._id.toString());

   const teamMembers = UpdatedOne.teams.flatMap(t => {

            const allTeamMembers = Array.isArray(t.members) ? t.members.map(t => t._id ? t._id.toString() : t.toString()) : []
            const teamManager =  t.manager ? (t.manager._id ? t.manager._id.toString() : t.manager.toString()) : null

            return [...allTeamMembers,teamManager]


        })

const managerId = UpdatedOne.manager && UpdatedOne.manager._id ? UpdatedOne.manager._id.toString() : null;

        const AllMembers = Array.from(new Set([...memberIds,managerId,...teamMembers]))
        const checkEntreprise = await Entreprise.findById(user.EntrepriseId)
        const AllMembersForConversation = Array.from(new Set([...memberIds,managerId,...teamMembers,checkEntreprise.owner]))
        await Notification.create({
            name:'Project Update',
            content:`Check ${UpdatedOne.name} to see Latest Update`,
            assignedTo:AllMembers
        })

        await Conversation.findOneAndUpdate({projectId:UpdatedOne._id},{members:AllMembersForConversation},{new:true})

        for (let member of AllMembers){

            io.to(`user:${member}`).emit('notifications_update',{

                   
                    name:'Project Update',
                    content:`Check ${UpdatedOne.name} to see Latest Update`, 
                    memberId:member
                })

            
        }

        res.status(200).json({
            message:'Project saved successfully',
            project:UpdatedOne,
            updatedFields:Object.keys(updatedFields)
        })
        
    } catch (error) {
        res.status(500).json({message:"Can't update the project please try again"})
        console.log("Can't update the project due to this",error);
    }
}


exports.deleteProject = async (req,res) => {



    try {

        const {id} = req.params
        const io = req.io

        if(!mongoose.isValidObjectId(id)){

            return res.status(400).json({message:"Enter a valid id"})
        }

        const wantedProject = await Project.findById(id)
        .populate({path:'teams',select:'_id name members manager',populate:[{path:'members',select:'_id firstName lastName email avatar'},{path:'manager',select:'_id firstName lastName email avatar'}]})


        if(!wantedProject){

            return res.status(404).json({message:"can't find this project"})
        }

        const deletedOne = await Project.deleteOne({_id:id})

        const deleteProjectConversation = await Conversation.deleteOne({projectId:wantedProject._id})
        const teamMembers = wantedProject.teams.flatMap(t => {

            const allTeamMembers = Array.isArray(t.members) ? t.members.map(t => t._id ? t._id.toString() : t.toString()) : []
            const teamManager =  t.manager ? (t.manager._id ? t.manager._id.toString() : t.manager.toString()) : null

            return [...allTeamMembers,teamManager]


        })

        const AllMembers = Array.from(new Set([...wantedProject.members.map(p => p._id.toString()),wantedProject.manager._id.toString(),...teamMembers]))


        await Notification.create({
            name:'Project Removed',
            content:`${wantedProject.name} has been removed`,
            assignedTo:AllMembers
        })

        for (let member of AllMembers){

            io.to(`user:${member}`).emit('notifications_update',{

                   
                     name:'Project Removed',
            content:`${wantedProject.name} has been removed`,
                    memberId:member
                })

            
        }

        if(deletedOne && deleteProjectConversation){


              res.status(200).json({
          
            message:'Project deleted Successfuly with the conversation',
            data:deletedOne

        })
        }

      
        
    } catch (error) {

        console.log("can't delete this project due to this",error);
        res.status(500).json({

            message:"Can't delete the project please try again!"
        })
        
        
    }
}


exports.getAllMember = async (req,res)=>{


    try {

        const {ownerId} = req.body
        const getOwner = await User.findById(ownerId)
        const companyMemebrs = await User.find({EntrepriseId:getOwner.EntrepriseId})
        
        if(!companyMemebrs){

            return res.status(404).json({

                message:"No memeber available"
            })
        }

        const companyMemebrswithoutBossAndManager = companyMemebrs.filter((item)=>  item._id.toString() !== getOwner._id.toString())
        

        

        


        res.status(200).json({
            message:"memebrs fetched successfuly",
            members:companyMemebrswithoutBossAndManager
        })
        
    } catch (error) {

        console.log("Can't fetch memebres due to this",error);
        res.status(500).json({

            message:"can't load members please try again"
        })
        
        
    }
}

exports.getAllTeams = async (req,res)=> {


    try {

        const teams = await Team.find()

        if(!teams){

            return res.status(404).json({
                message:"No teams for the moment"
            })
        }
        res.status(200).json(teams)
        
    } catch (error) {
        console.log("can't fetch teams due to this",error);
        res.status(500).json({
            message:"can't load teams please try again"
        })
        
    }
}



exports.createTask = async (req,res)=>{


  try {
        const {name,status,entrepriseId,projectId,createdBy}=req.body


        if(!entrepriseId || !projectId || !createdBy){
            return res.status(400).json({
                message:"EntrepriseId ,ProjectId and Task creator are obligaotry to track your task"
            })
        }

        if(!name || !status){
            return res.status(400).json({
                message:"task must have a title and status!"
            })
        }

        const createdtask = await Task.create({project:projectId,entrepriseId:entrepriseId,name:name,status:status,CreatedBy:createdBy})
        
        const updatedProject = await Project.findByIdAndUpdate(projectId,{$push:{tasks:createdtask._id}},{new:true})
        
        res.status(201).json({
            message:"Task created successfully", // 🎯 Fixed typo: "messge" -> "message"
            task:createdtask
        })
        
    } catch (error) {
        console.log("❌ createTask error:",error);
        res.status(500).json({
            message:"Can't create task please try again!"
        })
    }
}

exports.getTask = async (req,res)=>{


    try {
        const {projectId,entrepriseId}=req.body

        const user = req.user

        if(!mongoose.isValidObjectId(projectId)){

            return res.status(400).json({

                successs:false,
                message:"must have a valid projectID"
            })
        }
        const projectManager = await Project.findOne({_id:projectId})
        
        if(!entrepriseId || !projectId){
            return res.status(400).json({
                message:"EntrepriseId and ProjectId are obligaotry to track your tasks"
            })
        }

        const allAvailableTasks = await Task.find({project:projectId,entrepriseId:entrepriseId})
          if(!allAvailableTasks || allAvailableTasks.length === 0){
            return res.status(404).json({
                message:"No tasks available for now!"
            })
        }
        if(user.role==='manager' || (projectManager.manager && projectManager.manager && projectManager.manager.toString()===user.id.toString())){


            return  res.status(200).json({
            message:"Task assigned to project",
            tasks:allAvailableTasks
        })

        }
        if(user.role==='worker'){


            const filtredProjectTask = allAvailableTasks.filter(task=>{


                const isAssignedToTask = Array.isArray(task.assignedTo) && task.assignedTo.some(member=>member.toString()===user.id.toString())
                const isInTaskTeam = Array.isArray(task.team) && task.team.some(team=>{

                    const isManager = team && team.manager && team.manager.toString() === user.id.toString()

                    const inMemberInTeam = team && Array.isArray(team.members) && team.members.some(member=>member.toString()===user.id.toString())

                    return isManager || inMemberInTeam
                })


                return isAssignedToTask || isInTaskTeam

            })

            if(!filtredProjectTask){

                return res.status(404).json({


                    success:false,
                    message:"No tsk found for you"
                })

            }


            return res.status(200).json({

                success:true,
                message:"Availabel Tasks for you",
                tasks:filtredProjectTask

            })
        }

      



       
        
    } catch (error) {
        console.log("❌ getTask error:",error);
        res.status(500).json({
            message:"Can't find your tasks please try again"
        })
    }
}

exports.createComment = async (req,res)=>{

    const user = req.user
    const io = req.io


    try {

        const {projectId} = req.params
        const{content,userId}=req.body
        if(!mongoose.isValidObjectId(projectId)){

            return res.status(400).json({

                message:"Project Id must be valid!"
            })
        }
        if(!content || !userId || !mongoose.isValidObjectId(userId)){


            return res.status(400).json({

                message:"content and userId are obligatory fields!"
            })
        }
        const newComment = await Comment.create({content:content,createdBy:userId,projectId:projectId})
        const entrepriseCheck = await Entreprise.findById(user.EntrepriseId)
        const updatedCommentProject = await Project.findByIdAndUpdate(projectId,{$push:{comments:newComment._id}},{new:true})
        .populate({
    path: 'teams',
    select: '_id name description members manager',
    populate: [
      { path: 'manager', select: '_id firstName lastName avatar' },
      { path: 'members', select: '_id firstName lastName avatar' }
    ]
  });

  const teamMembers = updatedCommentProject.teams.flatMap(t => {

            const allTeamMembers = Array.isArray(t.members) ? t.members.map(t => t._id ? t._id.toString() : t.toString()) : []
            const teamManager =  t.manager ? (t.manager._id ? t.manager._id.toString() : t.manager.toString()) : null

            return [...allTeamMembers,teamManager]


        })

        const allUserIds = [
  ...(updatedCommentProject.members || []).map(m => m._id.toString()),
  updatedCommentProject.manager?._id?.toString(),
  entrepriseCheck.owner?.toString(),...teamMembers
].filter(Boolean);



const notificationRecipients = allUserIds.filter(id => id !== newComment.createdBy.toString());

// Remove duplicates
const uniqueRecipients = Array.from(new Set(notificationRecipients));
        


        await Notification.create({
            
            name: 'Project Comment',
            content:`A Comment Has Been Added to ${updatedCommentProject.name}`,
            assignedTo:uniqueRecipients,


               })

            for(let member of uniqueRecipients){


                io.to(`user:${member}`).emit('notifications_update',{
             

                    name: 'Project Comment',
                    content:`A Comment Has Been Added to ${updatedCommentProject.name}`, 
                    memberId:member
                })
            }


        res.status(201).json({

            message:"Comment created Successfuly",
            comment:newComment
        })

        
    } catch (error) {

        console.log("can't create comment due to this",error);
        res.status(500).json({

            message:"Can't create comment please try again"
        })
        
        
    }
}


exports.getComments = async(req,res)=>{


    try {
        const {projectId}=req.params


        if(!mongoose.isValidObjectId(projectId)){

            return res.status(400).json({

                message:"Provide a valid projectId"
            })
        }

        const allProjectComments = await Comment.find({projectId:projectId})
        .populate('createdBy','_id firstName lastName avatar').sort({createdAt:-1})


        if(!allProjectComments){

            return res.status(404).json({

                message:"No comments founded for this project"
            })
        }


        res.status(200).json({

            message:"Comments",
            comments:allProjectComments
        })
    } catch (error) {


        console.log("can't fetch comments due to this",error);
        res.status(500).json({

            message:"can't load comment please try again"
        })
        
        
    }
}

