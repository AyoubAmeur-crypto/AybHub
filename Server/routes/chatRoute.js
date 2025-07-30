const express = require("express")
const verifyToken = require("../middleware/verifytoken")
const {getAllAvailableMemebers,readMessage,getAllMessageHistory,getAllConversations} = require("../controllers/chatController")


const router = express.Router()

router.get("/getAvailableMemebers",verifyToken,getAllAvailableMemebers)
router.post("/getAllMessageHistory",verifyToken,getAllMessageHistory)
router.get("/getAllConversations",verifyToken,getAllConversations)

router.post("/readMessage",verifyToken,readMessage)


module.exports = router