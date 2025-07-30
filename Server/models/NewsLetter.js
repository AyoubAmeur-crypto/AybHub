const mongoose = require('mongoose')

const NewsLetter = new mongoose.Schema({


    email:{
        type:String
    }
},{timestamps:true})


module.exports = mongoose.model("newsLetter",NewsLetter)