const User = require('../models/User')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const OtpCode = require("../models/OtpCode")
const nodemailer = require("nodemailer")




exports.login = async  (req,res)=> {


    try {

        const {email,password} = req.body

        if(!email || !password){

            return res.status(401).json({message:"All fileds are required!"})

        }

        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        if(!regex.test(email)){

            return res.status(401).json({message:"Enter a valid email format"})
        }

        const checkUser = await User.findOne({email:email}).select('+password')

        if(!checkUser){

            return res.status(404).json({message:"User is not found"})
        }

        if(checkUser.provider === 'google' || checkUser.provider === 'facebook') {

            return res.status(401).json({message:`This email is associated with a ${checkUser.provider} please login with ${checkUser.provider}`})
        }

        const checkPassword = await bcrypt.compare(password,checkUser.password)

        if(!checkPassword){

            return res.status(401).json({message:"Pasword Doesn't match"})
        }

        const token = jwt.sign({id:checkUser._id,
            firstName:checkUser.firstName,
            lastName:checkUser.lastName,
            email:checkUser.email,
            role:checkUser.role,
            avatar:checkUser.avatar,
            plan:checkUser.plan,
            billingInfo:checkUser.billingInfo,
            teams:checkUser.teams,
            tasks:checkUser.tasks,
            projects:checkUser.projects,
            messages:checkUser.messages,
            settings:checkUser.settings,
            lastLogin:checkUser.lastLogin,
            loginHistory:checkUser.loginHistory,
            facebookId:checkUser.facebookId,
            googleId:checkUser.googleId,
            EntrepriseId:checkUser.EntrepriseId

        },process.env.TOKEN_KEY,{expiresIn:'1d'})

        
        

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax", 
            maxAge: 24 * 60 * 60 * 1000,
            path:'/'

        })

         if(!checkUser.role || !checkUser.EntrepriseId) {

      return res.status(200).json({redirectTo :'/tellusmore'})
    }


     res.status(200).json({redirectTo :'/workspace'})

        







        
    } catch (error) {

        console.log("error happened due to this",error);
        res.status(500).send("Internal server error")
        
        
    }
}

exports.signup = async (req,res)=>{


    try {

        const{firstname,lastname,email,password} = req.body

        const checkUserAvailibility = await User.findOne({email:email})

        if(!firstname || !lastname || !email || !password){

            return res.status(401).json({message:"All the inputs are required!"})
        }

        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        if(!regex.test(email)){

            return res.status(401).json({message:"Enter a valid email format"})
        }

        if(checkUserAvailibility){

            return res.status(401).json({message:"Email Already Exists , Continue to Login"})
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if(!strongPasswordRegex.test(password)){

            return res.status(401).json({message:"Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"})
        }

        const salt = await bcrypt.genSalt()

        const hashedPassword = await bcrypt.hash(password,salt)

        const NewUser = new User({

            firstName:firstname,
            lastName:lastname,
            email:email,
            password:hashedPassword

        })

        await NewUser.save()
         const token = jwt.sign({id:NewUser._id,
            firstName:NewUser.firstName,
            lastName:NewUser.lastName,
            email:NewUser.email,
            role:NewUser.role,
            avatar:NewUser.avatar,
            plan:NewUser.plan,
            billingInfo:NewUser.billingInfo,
            teams:NewUser.teams,
            tasks:NewUser.tasks,
            projects:NewUser.projects,
            messages:NewUser.messages,
            settings:NewUser.settings,
            lastLogin:NewUser.lastLogin,
            loginHistory:NewUser.loginHistory,
            facebookId:NewUser.facebookId,
            googleId:NewUser.googleId,
            


        },process.env.TOKEN_KEY,{expiresIn:'1d'})

        
        res.cookie('token', token, {
  httpOnly: true,
  secure: false, // for localhost
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
});

        


        res.status(200).json({redirectTo :'/tellusmore'})

        
    } catch (error) {


        console.log("error happended due to this",error);
        res.status(500).send("Internal server error")
        
        
    }
}

exports.otpCode = async (req,res)=> {


    try {

        const {email} = req.body
        
        if(!email){

            return res.status(401).json({message:"Enter an email please"})
        }


        const checkUser = await User.findOne({email:email})

      

        if(!checkUser){

            return res.status(404).json({message:"User Not Found!"})
        }
        
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if(!regex.test(email)){

            return res.status(401).json({
                message:'Enter A Valid Email Format'
            })
        }
        if(checkUser.provider === 'google' || checkUser.provider === 'facebook') {

            return res.status(401).json({message:`This email is associated with a ${checkUser.provider} to reset your password follow ${checkUser.provider} guidelines`})
        }
        const otpGenerated = Math.floor(100000 + Math.random() * 900000).toString()

        const Hashedotp = await bcrypt.hash(otpGenerated,10)

        await OtpCode.deleteMany({email:email})

        await OtpCode.create({
            email:email.trim().toLowerCase(),
            otpHash:Hashedotp,


        })






      const transporter = nodemailer.createTransport({
          service: 'Gmail', 
        auth: {
               user: process.env.EMAIL_SENDER,
               pass: process.env.EMAIL_PASS,
         },

         
  })

   await transporter.sendMail({
    from: '"AYBHUB" <noreply@AybHub.com>',
    to: email,
    subject: 'Your OTP Code',
    html: `
   <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Your Verification Code | AYB HUB</title>
  <style>
    body {
      background-color: #f0f4f8;
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .container {
      background-color: #ffffff;
      margin: 30px auto;
      padding: 40px;
      border-radius: 12px;
      max-width: 550px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .header {
      text-align: center;
      padding-bottom: 25px;
      border-bottom: 1px solid #e1e8ed;
      margin-bottom: 10px;
    }
    .logo {
      width: 120px;
      margin-bottom: 10px;
    }
    h1 {
      color: #1a365d;
      font-size: 24px;
      margin: 0;
      font-weight: 600;
    }
    p {
      color: #4a5568;
      font-size: 16px;
      line-height: 1.6;
      margin: 16px 0;
    }
    .otp-box {
      background: linear-gradient(135deg, #3182ce, #2c5282);
      color: white;
      font-size: 32px;
      font-weight: 700;
      text-align: center;
      padding: 24px 0;
      border-radius: 8px;
      margin: 30px 0;
      letter-spacing: 8px;
      box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
    }
    .message {
      background-color: #ebf8ff;
      border-left: 4px solid #3182ce;
      padding: 16px;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      font-size: 13px;
      color: #718096;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e1e8ed;
    }
    .social-links {
      margin: 20px 0;
      text-align: center;
    }
    .social-links a {
      display: inline-block;
      margin: 0 8px;
    }
    .social-icon {
      width: 32px;
      height: 32px;
    }
    .button {
      background: linear-gradient(135deg, #3182ce, #2c5282);
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      display: inline-block;
      margin-top: 16px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
<img src="https://i.ibb.co/mrYnmSvb/AYB-HUB-01.png" alt="AYB HUB" width="100" style="width: 250px" />
      <h1>Verification Code</h1>
    </div>
    
    <p>Hello,</p>
    
    <p>We received a request to reset your password for your AYB HUB account. Please use the verification code below to complete the process.</p>
    
    <div class="otp-box">${otpGenerated}</div>
    
    <p>This code will expire in <strong>5 minutes</strong> for security reasons.</p>
    
    <div class="message">
      <p><strong>Note:</strong> If you didn't request this password reset, please ignore this email or contact our support team immediately if you have concerns about your account security.</p>
    </div>
    
    <p>Need help? Our support team is available 24/7 to assist you.</p>
    
    <div style="text-align: center;">
      <a href="https://aybhub.com/support" class="button">Contact Support</a>
    </div>
    
    <div class="footer">
      <p>© 2025 AYB HUB. All rights reserved.</p>
      <p>Premium collaboration platform for teams and businesses</p>
      
      <div class="social-links">
        <a href="https://twitter.com/aybhub"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" class="social-icon"></a>
        <a href="https://linkedin.com/company/aybhub"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" class="social-icon"></a>
        <a href="https://facebook.com/aybhub"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" class="social-icon"></a>
      </div>
      
     
    </div>
  </div>
</body>
</html>
  `
   
  })

  res.status(201).json({message:`Otp has been sent to ${email}`})
        
    } catch (error) {

        console.log("Internal error due tot this",error);
        res.status(500).send("Internal error server ")
        
        
    }
}


exports.verifyOtp = async (req,res)=>{


   try {
    const {email, code} = req.body

    const checkOtp = await OtpCode.findOne({email: email.trim().toLowerCase()})
     if(!checkOtp) {
      return res.status(404).json({message: "OTP not found or expired. Please request a new code."});
    }

    if(!code) {
      return res.status(404).json({message: "Enter The Otp Code!"})
    }

 

    // Fix the code formatting - join without comma or use as is if it's already a string
    const realCode = Array.isArray(code) ? code.join('') : code

    const verifyotp = await bcrypt.compare(realCode, checkOtp.otpHash)

    if(!verifyotp) {
      return res.status(401).json({message: 'OTP Incorrect Or Expired. Please Try Again!'})
    }

    // Delete the OTP record after successful verification for security
    await OtpCode.deleteOne({email: email})
    
    return res.status(200).json({message: "Authentication Approved"})
  } catch (error) {
    console.log("Can't verify OTP due to this", error);
    return res.status(500).json({message: "Internal Server Error Please Try Again"})
  }
}

exports.changePassword = async (req,res)=>{


  try {


    const {email,password}=req.body

    const checkUser = await User.findOne({email:email})

    if(!checkUser){

      return res.status(404).json({message:"User Not Found"})
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if(!strongPasswordRegex.test(password)){

            return res.status(401).json({message:"Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"})
        }

    const newPass = await bcrypt.hash(password,10)

    checkUser.password=newPass

    await checkUser.save()
    res.status(200).json({redirectTo :'/login'})
    
  } catch (error) {

    console.log("smtg happended due to this",error);
    res.status(500).send("Internal Server Error")
    
    
  }
}