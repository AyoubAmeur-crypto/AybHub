const mongoose = require("mongoose")

const task = new mongoose.Schema({

    name:{

        type:String,
        required:true
    },
    description:{

        type:String,
    },
    due:{

        type:Date,
    },
    finishedAt:{

        type:Date
    },
    position:{
        type:Number,
        default:0
    },
    label:[{

        name:{type:String},
        color:{type:String}
    }],
    attachments:[{
         url:{
            type:String
        } ,
        filename: {type:String},
        cloudinaryId: {type:String},
        size: {type:Number},
        type:{type: String},
        uploadedAt:{ type:Date }
    }],
    status:{
        type:String,
        default:'todo',

        
    },
    priority:{

        type:String,
        enum:['Low','Medium','High','Urgent'],
        default:'Medium'
    },
    CreatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'},
    assignedTo:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    project:{

        type:mongoose.Schema.Types.ObjectId,
        ref:'ProjectV2'
    },
    team:[{

        type:mongoose.Schema.Types.ObjectId,
        ref:'Team'
    }],
  
    entrepriseId:{type:mongoose.Schema.Types.ObjectId , ref:'Entreprise'},
    subtask:[{

        item:String,
        isChecked:{
            type:Boolean,
            default:false
        }


    }],
    comment:[{

        type:mongoose.Schema.Types.ObjectId,
        ref:'TaskComment'
    }],
    activityLog:{

        type:mongoose.Schema.Types.ObjectId,
        ref:'activityLog'
    }
},{timestamps:true})


module.exports = mongoose.model("Task",task)