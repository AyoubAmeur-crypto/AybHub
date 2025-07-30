const mongoose = require("mongoose")

const activityLog = new mongoose.Schema({

    user:{

        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    action:{
        type:String
    },
    targetId:{
        type:mongoose.Schema.Types.ObjectId,
        refpath:'targetedId'
    },
    targetType:{

        type:String
        
    },
    message:{

        type:String,
        required:true
    },
    ip:{

        type:String

    }
})

module.exports = mongoose.model("activityLog",activityLog)