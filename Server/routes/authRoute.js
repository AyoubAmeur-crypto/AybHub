const express = require("express")

const {login,signup,otpCode,verifyOtp,changePassword} = require("../controllers/authControllers")
const {accessToGoogle,authenticateWithGoogle} = require("../controllers/googleAuthController")
const {accessToFacebbok,authenticatewithFacebbok} = require("../controllers/facebookAuthController")


const router = express.Router()

router.post("/login",login)
router.post("/signup",signup)
router.post("/reset-password",changePassword)
router.post("/otp-code",otpCode)
router.post("/verify-otp",verifyOtp)
router.get("/google",accessToGoogle)
router.get("/google/callback",authenticateWithGoogle)
router.get("/facebook",accessToFacebbok)
router.get("/facebook/callback",authenticatewithFacebbok)

module.exports = router