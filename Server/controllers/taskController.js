const Task = require("../models/task")
const Project = require("../models/Project")
const mongoose = require("mongoose")
const  TaskComent = require("../models/TaskComment");
const Entreprise = require("../models/Entreprise");
const User = require("../models/User")
const Notification = require("../models/notification");
const TaskComment = require("../models/TaskComment");

exports.addTask = async (req, res) => {
  try {
    const { name, status } = req.body;
    const { projectId } = req.params;
    const user = req.user;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Enter a name for your task!' });
    }

    // Validate projectId
    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    // Verify project exists and belongs to user's enterprise
    const project = await Project.findOne({ 
      _id: projectId, 
      entrepriseId: user.EntrepriseId 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const statusExists = project.taskStatuses.some(s => s.id === status);
    if (!statusExists) {
      return res.status(400).json({ message: 'Invalid status' });
    }

     await Task.updateMany(
      { project: projectId, status: status, entrepriseId: user.EntrepriseId },
      { $inc: { position: 1 } }
    );

    // New task goes at the top (position 0)
    const newTask = new Task({
      name: name.trim(),
      status: status,
      project: projectId,
      entrepriseId: user.EntrepriseId,
      CreatedBy:user.id,
      position: 0
    });

    await newTask.save();

    await Project.findByIdAndUpdate(projectId,{
      $push:{tasks:newTask._id}
    })

    res.status(200).json({
      message: "Task Created Successfully",
      task: newTask
    });

  } catch (error) {
    console.log("Can't create the task due to this", error);
    res.status(500).json({ message: "Can't create the task please try again" });
  }
};


exports.deleteTask = async (req,res)=>{


  try {
    const {taskId}=req.params
    const io = req.io
    const user = req.user

    if(!mongoose.isValidObjectId(taskId)){

      return res.status(400).json({

        message:"must have a valid taskId"
      })
    }
    const deletedTask = await Task.findByIdAndDelete(taskId)
    .populate({
    path: 'team',
    select: '_id name description members manager',
    populate: [
      { path: 'manager', select: '_id firstName lastName avatar' },
      { path: 'members', select: '_id firstName lastName avatar' }
    ]
  })
    if (!deletedTask) {
  return res.status(404).json({
    success: false,
    message: "Task not found"
  });
}
     const teamMembers = deletedTask.team.flatMap(t => {

            const allTeamMembers = Array.isArray(t.members) ? t.members.map(t => t._id ? t._id.toString() : t.toString()) : []
            const teamManager =  t.manager ? (t.manager._id ? t.manager._id.toString() : t.manager.toString()) : null

            return [...allTeamMembers,teamManager] })
     const AllMembers = Array.from(new Set([...deletedTask.assignedTo.map(t => t._id.toString()),...teamMembers]))

     const filtredTask = AllMembers.filter(id => id!== user.id.toString())
     

     const notification = await Notification.create({
                name: 'Task Removed',
                content:`${deletedTask.name} Has Been Removed`,
                assignedTo:filtredTask
            })
    
    
            if(notification){
    
    
                for(let member of filtredTask){
    
                    io.to(`user:${member}`).emit('notifications_update',{
                          
                  name: 'Task Removed',
                content:`${deletedTask.name} Has Been Removed`,
                        memberId:member
                    })
                }
            }


    if(deletedTask){

      return res.status(200).json({

        success:true,
        message:"Task deleted successfuy"
      })
    }
    
  } catch (error) {
    
    console.log("can't delete this task due to this",error);
    res.status(500).json({

      success:false,
      message:"Can't delete task please try again"
    })
    
  }
}


exports.getTaskStatuses = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findOne({
      _id: projectId,
      entrepriseId: user.EntrepriseId
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.taskStatuses.length === 0) {
      const doneColumn = {
        id: "done",
        label: "Done",
        color: "#6ee7b7"
      };
      project.taskStatuses.push(doneColumn);
      await project.save();
    }

    res.status(200).json({
      taskStatuses: project.taskStatuses
    });

  } catch (error) {
    console.log("can't get taskStatus for this project due to this", error);
    res.status(500).json({
      message: "can't get taskStatuses for this project please try again"
    });
  }
};


exports.fetchTasks = async (req,res)=>{


    try {

        const {projectId}=req.params
        const user = req.user

        if(!mongoose.isValidObjectId(projectId)){
          

          return res.status(400).json({

              success:false,
              message:"must have a valid projectId"
          })


        }

        const ProjectManager = await Project.findOne({_id:projectId}) .populate({
    path: 'teams',
    select: '_id name description members manager',
    populate: [
      { path: 'manager', select: '_id firstName lastName avatar' },
      { path: 'members', select: '_id firstName lastName avatar' }
    ]
  });

        if(user.role ==='manager' || (ProjectManager && ProjectManager.manager && ProjectManager.manager.toString() === user.id.toString())){

           const tasks = await Task.find({project:projectId,entrepriseId:user.EntrepriseId})
        .populate({path:'assignedTo',select:'_id firstName lastName avatar email'})
        .populate({path:'CreatedBy',select:'_id firstName lastName avatar email'})
        .populate({path:'team',select:'name description',populate:[
          {path:'members',select:'_id firstName lastName avatar'},
          {path:'manager',select:'_id firstName lastName avatar'}
        ]}).sort({position:1})

        if(!tasks || tasks.length===0){

            return res.status(404).json({

                message:"cannot find tasks for this project"
            })
        }

        

        return res.status(200).json({

            fetchedTasks : tasks || []
        })


        }

        if(user.role === 'worker'){

          const tasks = await Task.find({project:projectId,entrepriseId:user.EntrepriseId})
        .populate({path:'assignedTo',select:'_id firstName lastName avatar email'})
        .populate({path:'CreatedBy',select:'_id firstName lastName avatar email'})
        .populate({path:'team',select:'name description',populate:[
          {path:'members',select:'_id firstName lastName avatar'},
          {path:'manager',select:'_id firstName lastName avatar'}
        ]}).sort({position:1})

          const filtredTasks = tasks.filter(task => {
              const isMember = Array.isArray(task.assignedTo) && task.assignedTo.some(
                  member =>  member._id.toString() === user.id.toString()
              );
              const isInTeam = Array.isArray(task.team) && task.team.some(team => {
                  const memberMatch = Array.isArray(team.members) && team.members.some(
                      member =>  member._id.toString() === user.id.toString()
                  );
                  const managerMatch = team.manager && team.manager._id && team.manager._id.toString() === user.id.toString();
                  return memberMatch || managerMatch;
              });
          
              return isMember  || isInTeam;
          });

          if(!filtredTasks || filtredTasks.length === 0){

            return res.status(404).json({

              success:false,
              message:"No Available task for you"
            })
          }

          res.status(200).json({

            success:true,
            fetchedTasks:filtredTasks,
            message:"Available tasks"
          })
        }

       
        
    } catch (error) {

        console.log("can't foind tasks due to this",error);

        res.status(500).json({

            message:"Can't find tasks for this project please try again"
        })
        
        
    }
}


exports.updatetask = async (req,res)=>{


  try {

    const {taskId}=req.params
    const {updatedData}=req.body

    console.log("chek task ID",taskId);
    console.log("check passd data",updatedData);
    
    

    if(!mongoose.isValidObjectId(taskId)){

      return res.status(400).json({

        message:"Must have a valid taskId"
      })
    }

    

    const updatedTask = await Task.findById(taskId)
    let change=false
    if(!updatedTask){

      return res.status(404).json({

        message:"Cannot find the task!"
      })
    }

    for(let key in updatedData){

      if(updatedData[key] !== undefined){

        if(typeof updatedData[key] === 'string' && updatedData[key].trim() === ''){

          return res.status(400).json({
            success:false,
            message:`cannot update ${key} with an empty value! `
          })
        }
        

        updatedTask[key]=updatedData[key]
        change=true
        
        
        


      }
        }

        await updatedTask.save()

        if(change){

          return res.status(200).json({

            success:true,
            message:"task updated successfuly"
          })
        }




    
  } catch (error) {

    console.log("can't update the task due to this",error);
    res.status(500).json({

      success:false,
      message:"can't update the task please try again"
    })
    
    
  }
}

exports.updateFulltask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { updateAvailableCHANGES } = req.body;
    const io = req.io
    const user = req.user


    console.log("check if tittle is going",updateAvailableCHANGES);
    

    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({ message: "taskId must be valid" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateAvailableCHANGES },
      { new: true }
    ).populate({path:'team',select:'_id name description manager members',populate:[{path:'members',select:'_id firstName lastName avatar'},{path:'manager', select:'_id firstName lastName avatar'}]});

    if (!updatedTask) {
      return res.status(404).json({ message: "Cannot find the task" });
    }

     const teamMembers = updatedTask.team.flatMap(t => {

            const allTeamMembers = Array.isArray(t.members) ? t.members.map(t => t._id ? t._id.toString() : t.toString()) : []
            const teamManager =  t.manager ? (t.manager._id ? t.manager._id.toString() : t.manager.toString()) : null

            return [...allTeamMembers,teamManager]


        })

    const AllMembers = Array.from(new Set([...updatedTask.assignedTo.map(t => t._id.toString()),...teamMembers]))
    const filtreAllMembers = AllMembers.filter(id =>  id.toString() !== user.id.toString())

     const notification = await Notification.create({
                name: 'Task Update',
                content:`${updatedTask.name} Has Been Updated`,
                assignedTo:filtreAllMembers
            })
    
    
            if(notification){
    
    
                for(let member of filtreAllMembers){
    
                    io.to(`user:${member}`).emit('notifications_update',{
                          
    
                         name: 'Task Update',
                content:`${updatedTask.name} Has Been Updated`,
                        memberId:member
                    })
                }
            }

        console.log("new task updated",updatedTask);



    return res.status(200).json({
      success: true,
      message: "task updated successfully",
      updatedFields: updateAvailableCHANGES
    });

    
  } catch (error) {
    console.log("cannot update the task due to this", error);
    res.status(500).json({
      success: false,
      message: "Can't update the task please try again"
    });
  }
};

exports.updateColumnPositiion = async (req,res)=>{



    try {

        const {projectId}=req.params
        const {orderedColumns}=req.body
        const user = req.user


        if(!mongoose.isValidObjectId(projectId)){

            return res.status(400).json({

                message:"must have a valid entrepriseId"
            })
        }

        if(!Array.isArray(orderedColumns) || orderedColumns.length===0){

            return res.status(400).json({

                message:"must have an ordered column"
            })
        }

        const foundedProject = await Project.findOne({entrepriseId:user.EntrepriseId,_id:projectId})
        if(!foundedProject ){

            return res.status(404).json({

                message:"cannot find the project"
            })        }
        foundedProject.taskStatuses = orderedColumns

        await foundedProject.save()

        res.status(200).json({

            success:true,
            message:"Column ordred now succesfuly"
        })


        
    } catch (error) {
        
    }
}

exports.updateTaskOrder = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, orderedTaskIds } = req.body;
    const user = req.user;

    for (const { id, position } of orderedTaskIds) {
      await Task.findOneAndUpdate(
        { _id: id, project: projectId, status, entrepriseId: user.EntrepriseId },
        { position }
      );
    }

    res.status(200).json({  message: "Task order updated" });
  } catch (error) {
    console.error("Failed to update task order:", error);
    res.status(500).json({ success: false, message: "Failed to update task order" });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = req.user;
    const io = req.io
    const { status, projectId, position } = req.body;

    console.log("Updating task status:", { taskId, status, projectId, position });

    // Validate ObjectIds
    if (!mongoose.isValidObjectId(taskId) || !mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        message: "Invalid taskId or projectId"
      });
    }

    // Verify project belongs to user's enterprise
    const project = await Project.findOne({
      _id: projectId,
      entrepriseId: user.EntrepriseId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Check if task exists and belongs to the project and enterprise
    const task = await Task.findOne({
      _id: taskId,
      project: projectId,
      entrepriseId: user.EntrepriseId
    }).populate({
      path: 'team',
    select: '_id name description members manager',
    populate: [
      { path: 'manager', select: '_id firstName lastName avatar' },
      { path: 'members', select: '_id firstName lastName avatar' }
    ]
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Check if the new status exists in the project
    const statusExists = project.taskStatuses.some(s => s.id === status);
    if (!statusExists) {
      return res.status(400).json({
        message: "Invalid status. Status does not exist in this project"
      });
    }

    const oldStatus = task.status;
    const targetPosition = position || 0;

    // If moving to a different status
    if (oldStatus !== status) {
      // Update positions of tasks in the target status (shift them down)
      await Task.updateMany(
        {
          project: projectId,
          status: status,
          position: { $gte: targetPosition },
          entrepriseId: user.EntrepriseId
        },
        { $inc: { position: 1 } }
      );

      // Update positions of tasks in the old status (shift them up)
      await Task.updateMany(
        {
          project: projectId,
          status: oldStatus,
          position: { $gt: task.position },
          entrepriseId: user.EntrepriseId
        },
        { $inc: { position: -1 } }
      );
    } else {
      // Moving within the same status
      if (targetPosition > task.position) {
        // Moving down: shift tasks up
        await Task.updateMany(
          {
            project: projectId,
            status: status,
            position: { $gt: task.position, $lte: targetPosition },
            entrepriseId: user.EntrepriseId
          },
          { $inc: { position: -1 } }
        );
      } else if (targetPosition < task.position) {
        // Moving up: shift tasks down
        await Task.updateMany(
          {
            project: projectId,
            status: status,
            position: { $gte: targetPosition, $lt: task.position },
            entrepriseId: user.EntrepriseId
          },
          { $inc: { position: 1 } }
        );
      }
    }

    // Update the task
    task.status = status;
    task.position = targetPosition;
    await task.save();

   
const entrepriseCheck = await Entreprise.findOne({_id:user.EntrepriseId})
if(!entrepriseCheck){


  return res.status(404).json({

    success:false,
    message:"Cannot find entreprise"
  })
}

 const assignedToIds = Array.isArray(task.assignedTo)
  ? task.assignedTo.map(t => t._id.toString())
  : [];
const manager = project.manager._id.toString() 
const Owner = entrepriseCheck.owner._id.toString()
const teamMembers = task.team.flatMap(t => {

            const allTeamMembers = Array.isArray(t.members) ? t.members.map(t => t._id ? t._id.toString() : t.toString()) : []
            const teamManager =  t.manager ? (t.manager._id ? t.manager._id.toString() : t.manager.toString()) : null

            return [...allTeamMembers,teamManager]


        })

const AssignedNot =[...assignedToIds, manager,Owner,...teamMembers].filter(id => id !== user.id.toString())
    
const AllMembers = Array.from(new Set(AssignedNot))


     const notification = await Notification.create({
                name: 'Task Status Update',
                content:`${task.name} moved from ${oldStatus} to ${status}`,
                assignedTo:AllMembers
            })
    
    
            
    
    
                for(let member of AllMembers){
    
                    io.to(`user:${member}`).emit('notifications_update',{
                          
    
                         name: 'Task Status Update',
                           content:`${task.name} moved from ${oldStatus} to ${status}`,
                        memberId:member
                    })
                }
            

    res.status(200).json({
      message: "Task status updated successfully",
      task: {
        _id: task._id,
        name: task.name,
        status: task.status,
        position: task.position,
        project: task.project,
        updatedAt: task.updatedAt
      }
    });

  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({
      message: "Internal server error. Please try again."
    });
  }
};


exports.addTaskStatuses = async (req,res)=>{


    try {
        const {id,label,color}=req.body
        const {projectId}=req.params
        if(!mongoose.isValidObjectId(projectId)){
            
            return res.status(400).json({
                message:"Enter a valid projectId"
            })

        }

        if(id.trim() === 'done'){

            return res.status(400).json({

                message:"done column is already exist! use a different id"
            })
        }

        const findProject = await Project.findById(projectId)
        if(!findProject){
            return res.status(404).json({message:"Project Not found"})
        }

        const checkStatus = findProject.taskStatuses.some(p=>p.id===id.trim())
        if(checkStatus){
            return res.status(400).json({
                message:"colomun already exist!"
            })
        }

        findProject.taskStatuses.push({id:id,label:label,color:color})

        await findProject.save()

        res.status(201).json({

            message:"Column created Successfuly"
        })
        
    } catch (error) {
        console.log("can't create column due to this",error);
        res.status(500).json(
            {
                message:"Can't create column please try again"
            }
        )
        
    }
}


exports.deleteTaskStatuses = async (req,res)=>{


    try {

        const {projectId} =req.params
        const {deletedColumnId}=req.body
        console.log("deleted column id ",deletedColumnId);
        
        if(!mongoose.isValidObjectId(projectId)){
            return res.status(400).json({
                message:"Not a valid projectId"
            })
        }
        const foundedProject = await Project.findById(projectId)
        if(!foundedProject){
            return res.status(404).json({
                message:"project not found"
            })
        }
     
        if (deletedColumnId.id.trim() === 'done') {
  return res.status(400).json({ message: "'done' column can't be deleted" });
}

        foundedProject.taskStatuses =  foundedProject.taskStatuses.filter(p=>p.id !== deletedColumnId.id)

        await foundedProject.save()

        res.status(200).json({
            message:"Column deleted Successfuly",
            filtredColumns:foundedProject.taskStatuses
        })


        
    } catch (error) {

        console.log("can't delete column due to this",error);
        res.status(500).json({

            message:"can't cdelete the column please try again!"
        })
        
        
    }
}

exports.updateColumn = async(req,res)=>{


    try {

        const {label,color,id}=req.body
        const {projectId}=req.params
         if(!mongoose.isValidObjectId(projectId)){
            return res.status(400).json({
                message:"Not a valid projectId"
            })
        }
         const foundedProject = await Project.findById(projectId)
        if(!foundedProject){
            return res.status(404).json({
                message:"project not found"
            })
        }

        const isStusesExist = foundedProject.taskStatuses.find(p=>p.id===id.trim())

        if(!isStusesExist){

            return res.status(404).json({
                message:"Columun is not exist in the project"
            })
        }

        if(label) isStusesExist.label=label.trim()
        if(color) isStusesExist.color=color

        await foundedProject.save()

        res.status(200).json({

            message:`colomun ${id} has been updated successfuly`
        })



    } catch (error) {

        console.log("can't update the column due to this ",error);
        res.status(500).json({

            message:"can't update the column please try again"
        })
        
        
    }
}


// attachments 


exports.uploadAttachements = async (req, res) => {


     
    
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


        console.log(attachments);
        

       

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


exports.AddSubTask =async (req,res)=>{

  try {


    const {taskId}=req.params
    const {item}=req.body
    const user = req.user
    const io = req.io


    if(!mongoose.isValidObjectId(taskId)){

      return res.status(400).json({

        message:"Must be a valid taskId"
      })
    }
    
    const foundedTask = await Task.findByIdAndUpdate(taskId,{$push:{subtask:{item:item,isChecked:false}}},{new:true})
    .populate({
       path: 'team',
    select: '_id name description members manager',
    populate: [
      { path: 'manager', select: '_id firstName lastName avatar' },
      { path: 'members', select: '_id firstName lastName avatar' }
    ]
    })




    if(!foundedTask){

      return res.status(404).json({
        success:false,
        message:"Cannot find the task"
      })
    }

    await foundedTask.save()

    const memberId = foundedTask.assignedTo.map(p=>p._id.toString())
    const fullProject = await Project.findById(foundedTask.project).populate({path:'manager',select:'_id firstName lastName avatar'})
    const teamMembers = foundedTask.team.flatMap(t => {

            const allTeamMembers = Array.isArray(t.members) ? t.members.map(t => t._id ? t._id.toString() : t.toString()) : []
            const teamManager =  t.manager ? (t.manager._id ? t.manager._id.toString() : t.manager.toString()) : null

            return [...allTeamMembers,teamManager] })

    const AllMembers = Array.from(new Set([...memberId,...teamMembers,fullProject.manager._id.toString()]))

    const filtredMembers = AllMembers.filter(id => id!==user.id.toString())

    await Notification.create({

      name:'SubTask Assignment',
      content:`SubTask Has Been Added to ${foundedTask.name}`,
      assignedTo:filtredMembers
    })


    for(let member of filtredMembers){
io.to(`user:${member}`).emit('notifications_update', {
  name: 'SubTask Assignment',
  content: `You have been assigned to task ${foundedTask.name}`,
  memberId: member
});
      
    }
 


    res.status(201).json({

      success:true,
      message:"SubTask created successfully",
      subTasks:foundedTask.subtask
    })  } catch (error) {


      console.log("can't create subtask due to this",error);
      res.status(500).json({

        success:false,
        message:"can't create subtask please try again"
      })
      
    
  }

}


exports.fetchSubTask = async (req,res)=>{


  try {

    const {taskId}=req.params

    const checkTask = await Task.findById(taskId)

    if(!checkTask){

      return res.status(404).json({

        success:false,
        message:"task not found"
      })


    }

    res.status(200).json({

      success:true,
      message:"subtsk fetched uccessfuly",
      subTasks:checkTask.subtask
    })
    
  } catch (error) {


       console.log("can't fetch subtasks due to this",error);
      res.status(500).json({

        success:false,
        message:"can't fetch subtasks please try again"
      })
    
  }
}


exports.removeSubTask = async (req,res)=>{


  try {

    const {taskId}=req.params
    const {idx}=req.body

    if(!mongoose.isValidObjectId(taskId)){

      return res.status(400).json({
        success:false,
        message:"Must have a valid taskId"
      })
    }

    const wantedTask = await Task.findOne({_id:taskId})

    if(!wantedTask){

      return res.status(404).json({

        success:false,
        message:"Not founded Task"
      })
    }

    wantedTask.subtask = wantedTask.subtask.filter((p,i)=> i !==idx)

    await wantedTask.save()

    res.status(200).json({
      success:true,
      message:"Subtask deleted successfully",
      subTasks: wantedTask.subtask
    });


    
  } catch (error) {

     console.log("can't delete subtask due to this",error);
    res.status(500).json({
      success:false,
      message:"can't delete subtask please try again"
    });
    
    
  }
}


exports.UpdateSubTask = async (req,res)=>{


  try {

    const {taskId}=req.params
    const {idx}=req.body
    const io = req.io
    const user = req.user

    const checkTask = await Task.findById(taskId)
      .populate({
    path: 'team',
    select: '_id name description members manager',
    populate: [
      { path: 'manager', select: '_id firstName lastName avatar' },
      { path: 'members', select: '_id firstName lastName avatar' }
    ]
  });

    if(!checkTask){

      return res.status(404).json({

        success:false,
        message:"can't found the task"
      })
    }

    checkTask.subtask[idx].isChecked = !checkTask.subtask[idx].isChecked
    await checkTask.save()
    

     const memberId = checkTask.assignedTo.map(p=>p._id.toString())
     const fullProject = await Project.findById(checkTask.project).populate({path:'manager',select:'_id firstName lastName avatar'})

     const teamMembers = checkTask.team.flatMap(t => {

            const allTeamMembers = Array.isArray(t.members) ? t.members.map(t => t._id ? t._id.toString() : t.toString()) : []
            const teamManager =  t.manager ? (t.manager._id ? t.manager._id.toString() : t.manager.toString()) : null

            return [...allTeamMembers,teamManager] })
    const AllMembers = Array.from(new Set([...memberId,...teamMembers,fullProject.manager._id.toString()]))

    const filtredMemebrs = AllMembers.filter(id => id !== user.id)

    
    

    await Notification.create({

      name:'Subtask Status Changed',
      content:`SubTask Status Has Been Updated to ${checkTask.name}`,
      assignedTo:filtredMemebrs
    })


    for(let member of filtredMemebrs){
io.to(`user:${member}`).emit('notifications_update', {
  name:'Subtask Status Changed',
  content:`SubTask Status Has Been Updated to ${checkTask.name}`,
  memberId: member
});
      
    }

    res.status(200).json({

      success:true,
      message:"subtask status changed successfully"

    })


    
  } catch (error) {

    
       console.log("can't update subtasks due to this",error);
      res.status(500).json({

        success:false,
        message:"can't update subtasks please try again"
      })
    
  }
}

exports.addComment = async (req,res)=>{

  try {

    const user = req.user
    const {taskId}=req.params
    const {content} = req.body
    const io = req.io


    const newComment = new TaskComent({content:content,taskId:taskId,createdBy:user.id})

    await newComment.save()

    const findTask = await Task.findByIdAndUpdate(taskId,{$push:{comment:newComment}},{new:true}) 
    .populate({
    path: 'team',
    select: '_id name description members manager',
    populate: [
      { path: 'manager', select: '_id firstName lastName avatar' },
      { path: 'members', select: '_id firstName lastName avatar' }
    ]
  });

    await findTask.save()

    const assignedToIds = Array.isArray(findTask.assignedTo)
  ? findTask.assignedTo.map(t => t._id.toString())
  : [];
const createdById = findTask.CreatedBy._id.toString()

const teamMembers = findTask.team.flatMap(t => {

            const allTeamMembers = Array.isArray(t.members) ? t.members.map(t => t._id ? t._id.toString() : t.toString()) : []
            const teamManager =  t.manager ? (t.manager._id ? t.manager._id.toString() : t.manager.toString()) : null

            return [...allTeamMembers,teamManager] })

const AllMembers = Array.from(new Set(
  [...assignedToIds, createdById,...teamMembers].filter(id => id && id !== user.id.toString())
));

    const notification = await Notification.create({
                name: 'Task Comment',
                content:`A Comment Has Been Added in ${findTask.name}`,
                assignedTo:AllMembers
            })
    
    
            if(notification){
    
    
                for(let member of AllMembers){
    
                    io.to(`user:${member}`).emit('notifications_update',{
                          
    
                         name: 'Task Comment',
                content:`A Comment Has Been Added in ${findTask.name}`,
                        memberId:member
                    })
                }
            }


    return res.status(200).json({

      success:true,
      message:"Comment added successsfully"
    })
    
  } catch (error) {

    console.log("can't add comment due to this",error);
    res.status(500).json({
      success:false,
      message:"Can't add comment please try again"
    })
    
    
  }
}


exports.getComment = async (req,res)=>{


  try {

    const {taskId}=req.params
    if(!mongoose.isValidObjectId(taskId)){

      return res.status(400).json({

        successs:false,
        message:"must have a valid TaskID"
      })
    }


    const allTaskComment = await TaskComment.find({taskId:taskId})
    .populate({path:'createdBy',select:'_id firstName lastName avatar'})
    .sort({createdAt:-1})

    if(!allTaskComment){

      return res.status(404).json({

        success:false,
        message:"No Comment found for this task"
      })
    }


    

    res.status(200).json({

      success:true,
      comments:allTaskComment
    })
    
  } catch (error) {

    console.log("cannot fetch comments due to this",error);

    res.status(500).json({


      success:false,

      message:"can't detch comments please try again"
    })
    
    
  }
}

exports.updateColumnTitle = async (req,res)=>{


  try {

    const {id,label}=req.body
    const {projectId}=req.params

    if(!mongoose.isValidObjectId(projectId)){
      
      return res.status(400).json({

        success:false,
        message:"Must have a valid projectId"
      })
      
    }
    const foundproject = await Project.findById(projectId)

    if(!foundproject){

      return res.status(404).json({

        success:false,
        message:"Cannot find task"
      })
    }

    const CheckColumnExist = foundproject.taskStatuses.find(p=>p.id === id)

    if(!CheckColumnExist){

      return res.status(404).json({
        success:true,
        message:"Column not found"
      })
    }

    CheckColumnExist.label=label

    await foundproject.save()

    return res.status(200).json({

      success:true,
      message:"Column updated successfuly"
    })


    
  } catch (error) {

    console.log("cannot update the title due to this",error);

    res.status(500).json({

      success:false,
      message:"Can't update column due to this"
    })
    
    
  }
}


exports.getAllMemberTask = async (req,res)=>{


    try {

        const {managerId} = req.body
        const fullManagerProfile = await User.findOne({_id:managerId})
        const entreprise = await Entreprise.findOne({_id:fullManagerProfile.EntrepriseId})

        const companyMemebrs = await User.find({EntrepriseId:fullManagerProfile.EntrepriseId})
        
        if(!companyMemebrs){

            return res.status(404).json({

                message:"No memeber available"
            })
        }

        const companyMemebrswithoutBossAndManager = companyMemebrs.filter(item=> 
          item._id.toString() !== fullManagerProfile._id.toString() && 
          item._id.toString() !== entreprise.owner.toString())
        

        

        


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