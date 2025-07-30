const express = require("express")
const {AddMailToNewsLetter} = require("../controllers/newsetterController")

const router = express.Router()

router.post("/sendEmail",AddMailToNewsLetter)


module.exports = router