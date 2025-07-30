const mongoose = require("mongoose")


const Invitation = new mongoose.Schema({

     email: { type: String, required: true },
  post: { type: String, required: true },
  code: { type: String, required: true },
  entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  user:{type:mongoose.Schema.Types.ObjectId , ref:'User'}

})


module.exports = mongoose.model("invitation",Invitation)