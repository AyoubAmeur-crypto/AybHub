// empty for the moment until its sprint

const mongoose = require("mongoose")


const conversation = new mongoose.Schema({

members:[{

    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
}],
isGroup:{
    type:Boolean,
    default:false
},
lastMsg:{

    type:mongoose.Schema.Types.ObjectId,
    ref:'Chat'
},
chatName:{

    type:String
},
 groupType: {
    type: String,
    enum: ['project', 'team'],
    default: null,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectV2',
    default: null,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  entrepriseId:{

    type:mongoose.Schema.Types.ObjectId,
    ref:'Entreprise'
  }

},{timestamps:true})


module.exports = mongoose.model('Conversation',conversation)