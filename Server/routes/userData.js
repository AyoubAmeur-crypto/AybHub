
const express = require("express")
const {fetchData,setRole} = require("../controllers/dataController")
const verifyToken = require("../middleware/verifytoken")
const router = express.Router()

router.get("/me",verifyToken,fetchData)
router.post("/role",verifyToken,setRole)


module.exports = router