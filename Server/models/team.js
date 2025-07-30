
const mongoose = require("mongoose")
const team = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, default: '' },
  members: [
    
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    
  ],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProjectV2' }],
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entrepriseId:{type:mongoose.Schema.Types.ObjectId , ref:'Entreprise'},
}, {
  timestamps: true
});


module.exports = mongoose.model('Team',team)