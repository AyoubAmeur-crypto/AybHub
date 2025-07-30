const mongoose = require("mongoose")


const Entreprise = new mongoose.Schema({

    name:{
        type:String
    },
    description:{

        type:String,
    },
    owner:{

        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    code:{

        type:String,
        unique:true
    },
    workers:[{
        post:{
            type:String
        },
        member:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    }]
})


module.exports = mongoose.model("Entreprise",Entreprise)