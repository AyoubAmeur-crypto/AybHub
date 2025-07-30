const express = require("express")
const verifyToken = require("../middleware/verifytoken")
const { logout,getInfos,getTeamInfos,TaskInfo,getRecentProjects,getDashboardNotifications ,getCalendarInfos} = require("../controllers/dashboardController")

const router = express.Router()

router.post("/logout",logout)
router.get("/getInfos",verifyToken,getInfos)
router.get("/getRecentProject",verifyToken,getRecentProjects)
router.get("/getRecentNotifications",verifyToken,getDashboardNotifications)
router.get("/getCalendarNotifications",verifyToken,getCalendarInfos)
router.get("/getTeamsInfo",verifyToken,getTeamInfos)
router.get("/getTaskInfo",verifyToken,TaskInfo)





module.exports = router

