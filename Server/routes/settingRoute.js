const express = require("express")

const verfiyToken = require("../middleware/verifytoken")
const {getMembersInfos,getTeams,getInvitations,removeFromTeam,deleteForEver,changePassowrd,getExactInfos} = require("../controllers/settingController")
const verifyToken = require("../middleware/verifytoken")


const router = express.Router()

router.get("/getMemberInfos",verfiyToken,getMembersInfos)
router.get("/getTeamInfos",verfiyToken,getTeams)
router.get("/getInvitations",verfiyToken,getInvitations)
router.delete("/deleteUser/:deletedId",verifyToken,removeFromTeam)
router.delete("/deleteUser",verifyToken,deleteForEver)
router.post("/updatePassword",verifyToken,changePassowrd)
router.get("/getExactInvitation",verifyToken,getExactInfos)









module.exports = router 