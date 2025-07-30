const express = require("express")
const verifyToken = require("../middleware/verifytoken")
const {getTaskProjects} = require("../controllers/calendarController")


const router = express.Router()

router.get("/project-task",verifyToken,getTaskProjects)

module.exports = router