const mongoose = require("mongoose");
const Entreprise = require("../models/Entreprise");
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const Team = require("../models/team")
const Task = require("../models/task")
const Project = require("../models/Project")
const Comment = require("../models/Comment")
const Converssation = require("../models/Conversation")
const Chat = require("../models/Chat");
const TaskComment = require("../models/TaskComment");
require("dotenv").config()

mongoose.connect('mongodb+srv://ayoubameur:R-TDMAsnKq-Td4T@cluster0.knu0m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0') 
  .then(async () => {
    await Entreprise.deleteMany({});
    await User.deleteMany({});
    await Invitation.deleteMany({});
    await Team.deleteMany({})
    await Task.deleteMany({})
    await TaskComment.deleteMany({})
    await Converssation.deleteMany({})
    await Project.deleteMany({})
    await Chat.deleteMany({})
    await Comment.deleteMany({})
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });