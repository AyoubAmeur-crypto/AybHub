const express = require("express")

const mongoose = require("mongoose")
const verifyToken = require("../middleware/verifytoken")
const {sendMsgNotification,getNotifications}= require("../controllers/notificationController")


const router = express.Router()



router.get("/getMessageNotification",verifyToken,sendMsgNotification)
router.get("/getAllNotifications",verifyToken,getNotifications)


module.exports = router