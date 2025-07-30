const mongoose = require("mongoose")

const comment = new mongoose.Schema({

    content:{

        type:String,
       
        
    },
     createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        projectId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Project'
        }
},{timestamps:true})

module.exports=mongoose.model("ProjectComment",comment)