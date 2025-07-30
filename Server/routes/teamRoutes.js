const express = require("express")
const {createTeam,fetchTeams,deleteTeam,updateTeam}= require("../controllers/teamController")
const verifyToken = require("../middleware/verifytoken")


const router = express.Router()

router.post("/createTeam",verifyToken,createTeam)
router.get("/getTeams",verifyToken,fetchTeams)
router.delete("/deleteTeam/:teamId",verifyToken,deleteTeam)
router.post("/updateTeam/:teamId",verifyToken,updateTeam)





module.exports = router