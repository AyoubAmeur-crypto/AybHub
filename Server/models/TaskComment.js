const mongoose = require("mongoose")


const CommentTask = new mongoose.Schema({


       content:{
    
            type:String,
           
            
        },
         createdBy:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            },
           
            taskId:{

                type:mongoose.Schema.Types.ObjectId,
                ref:'Task'
            }
},{timestamps:true})

module.exports = mongoose.model("TaskComment",CommentTask)