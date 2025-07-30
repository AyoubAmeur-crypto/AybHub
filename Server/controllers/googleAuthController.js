const passport = require("passport")
const jwt = require("jsonwebtoken")
exports.accessToGoogle = passport.authenticate("google", { scope: ["profile", "email"] })
exports.authenticateWithGoogle = [ passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/login" }), (req,res)=>{

    const user = req.user

    const token = jwt.sign({id:user._id,
            firstName:user.firstName,
            lastName:user.lastName,
            email:user.email,
            role:user.role,
            avatar:user.avatar,
            plan:user.plan,
            billingInfo:user.billingInfo,
            teams:user.teams,
            tasks:user.tasks,
            projects:user.projects,
            messages:user.messages,
            settings:user.settings,
            lastLogin:user.lastLogin,
            loginHistory:user.loginHistory,
            facebookId:user.facebookId,
            googleId:user.googleId,
            EntrepriseId:user.EntrepriseId

        },process.env.TOKEN_KEY,{expiresIn:'24h'})



res.cookie('token', token, {
  httpOnly: true,
  secure: false, // for localhost
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
});


              if(!user.role || !user.EntrepriseId){


              return res.redirect("http://localhost:5173/tellusmore")
            }


            res.redirect("http://localhost:5173/workspace")

} ]