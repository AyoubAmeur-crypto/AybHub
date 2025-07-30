const User = require("../models/User");
const jwt = require("jsonwebtoken")

exports.fetchData = (req,res)=> {



    try {

        const user = req.user

        if(!user){


            return res.status(404).json({

                message:"User not found"
            })
        }


        res.status(200).json(user)
        
    } catch (error) {


        console.log("Internal sever error die to this",error);

        res.status(500).send("Internal error server")
        
        
    }
}

exports.setRole = async (req,res)=>{



    try {
        const {id,role}=req.body

       
        const setRoleUser = await User.findById(id)
        if(!setRoleUser){

            return res.status(404).json({
                message:"User is not exist"
            })
        }

        setRoleUser.role=role
        await setRoleUser.save()

         const newToken = jwt.sign({id:setRoleUser._id,
                    firstName:setRoleUser.firstName,
                    lastName:setRoleUser.lastName,
                    email:setRoleUser.email,
                    role:setRoleUser.role,
                    avatar:setRoleUser.avatar,
                    plan:setRoleUser.plan,
                    billingInfo:setRoleUser.billingInfo,
                    teams:setRoleUser.teams,
                    tasks:setRoleUser.tasks,
                    projects:setRoleUser.projects,
                    messages:setRoleUser.messages,
                    settings:setRoleUser.settings,
                    lastLogin:setRoleUser.lastLogin,
                    loginHistory:setRoleUser.loginHistory,
                    facebookId:setRoleUser.facebookId,
                    googleId:setRoleUser.googleId,
                    EntrepriseId:setRoleUser.EntrepriseId

                },process.env.TOKEN_KEY,{expiresIn:'24h'})
        
        
        
        res.cookie('token',newToken, {
          httpOnly: true,
          secure: false, // for localhost
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        });

       if(!setRoleUser.EntrepriseId){

        if(setRoleUser.role === 'manager'){

            return res.status(200).json({
                redirectUrl:'/inviteMembers'
            })
        }
        if(setRoleUser.role === 'worker'){

            return res.status(200).json({
                redirectUrl:'/assignCode'
            })
        }
       }
         res.status(200).json({
                redirectUrl:'/workspace'
            })
    } catch (error) {

        res.status(500).json({
            message:"Can't set role for this user please try again",

        })
        console.log("Can't set role for this user die to this",error);
        
        
    }
}