
const passport = require("passport")
const jwt =require("jsonwebtoken")
exports.accessToFacebbok =   passport.authenticate('facebook',{ scope: ["public_profile", "email"] });


exports.authenticatewithFacebbok =  [ passport.authenticate('facebook', { failureRedirect: 'http://localhost:5173/login' }),
 async (req,res)=>  {
  try {

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

        


    
  } catch (error) {

    console.log("smtg happende due to this",error);
    
    
  }

 } ]