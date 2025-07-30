const mongoose = require('mongoose');




const project = new mongoose.Schema({
  name: {
    type: String,    
  },
  description: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
   attachments: [{ 
        url:{
            type:String
        } ,
        filename: {type:String},
        cloudinaryId: {type:String},
        size: {type:Number},
        type:{type: String},
        uploadedAt:{ type:Date }
    }],
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    }
  ],
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }
  ],
  taskStatuses:[{

    id:{type:String},
    label:{type:String},
    color:{type:String},
    position:{type:Number,
      default:0
    }
  }],
  dueDate: {
    type: Date,
    required: false
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status:{

    type:String,
    enum:['Planning','In Progress','Completed','On Hold'],
    default:'Planning'

  },
  comments:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'ProjectComment'
  }],
  entrepriseId:{

    type:mongoose.Schema.Types.ObjectId,
    ref:'Entreprise'
  },

}, {
  timestamps: true
});



module.exports = mongoose.model('ProjectV2', project);
