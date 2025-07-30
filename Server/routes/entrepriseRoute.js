const express = require("express")

const {createEntreprise,inviteMember,acceptInvitationPh1,acceptInvitationPh2} = require("../controllers/entrepriseController")
const verifyToken = require("../middleware/verifytoken")

const router = express.Router()


router.post("/create",verifyToken,createEntreprise)
router.post("/inviteMembers",verifyToken,inviteMember)
router.post("/acceptInvitationph1",verifyToken,acceptInvitationPh1)
router.post("/acceptInvitationph2",verifyToken,acceptInvitationPh2)




module.exports = router