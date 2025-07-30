const mongoose = require("mongoose")


const notification = new mongoose.Schema({


    name:{

        type:String
    },
     content:{

        type:String
    },
    assignedTo:[{

        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
  
},{timestamps:true})


module.exports = mongoose.model('notification',notification)