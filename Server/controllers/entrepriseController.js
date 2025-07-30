const Entreprise = require("../models/Entreprise")
const User = require("../models/User")
const nodemailer = require("nodemailer")
const Invitation = require("../models/Invitation")
const jwt = require("jsonwebtoken")

function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}


exports.createEntreprise = async (req,res)=> {



    try {

        const {name,description,owner} = req.body


        if(!name || !description || !owner){

            res.status(400).json({

                message:"Entreprise must have a name , description and owner!"
            })
        }

        console.log("request data",req.body);
        const uniqueCode = generateCode()

        

        

        const newEntreprise = new Entreprise({
            name:name,
            description:description,
            code:uniqueCode,
            owner:owner
        })

        await newEntreprise.save()

        const OwnerOfEntreprie = await User.findByIdAndUpdate(owner,{EntrepriseId:newEntreprise._id},{new:true})

        res.status(201).json({

            message:`Entreprise Created Successfuly , name : ${newEntreprise.name} name : ${OwnerOfEntreprie.firstName}`,
            code:uniqueCode,
            
        })
        
    } catch (error) {


        console.log("Can't create entrepise due to this",error);
        res.status(500).json({

            message:"Can't create entreprise please try again!"
        })
        
        
    }
}

exports.inviteMember = async (req,res)=> {

    try {

        const {ownerId,emails}=req.body

        if(!ownerId || !emails){

            return res.status(400).json({

                message:"All the fileds are required"
            })
        }

        let emailList = Array.isArray(emails) ? emails : []


        if(emailList.length === 0){

            return res.status(400).json({
        message: "you need at least to enter one email to go!"})
        }

        const fullUser = await User.findById(ownerId)
        const wantedentreprise = await Entreprise.findById(fullUser.EntrepriseId)

          const transporter = nodemailer.createTransport({
                  service: 'Gmail', 
                auth: {
                       user: process.env.EMAIL_SENDER,
                       pass: process.env.EMAIL_PASS,
                 },
        
                 
          })

          await Promise.all(emailList.map(async (email)=>{

            if(!email.email || !email.post) return

          const existingUser = await User.findOne({ email: email.email });
            if (existingUser && existingUser.EntrepriseId && 
                existingUser.EntrepriseId.toString() === wantedentreprise._id.toString()) {
                return { error: `${email.email} is already a member` };
            }

            // ✅ CHECK FOR EXISTING PENDING INVITATIONS
            const existingInvitation = await Invitation.findOne({
                email: email.email,
                entreprise: wantedentreprise._id,
                status: { $ne: 'accepted' }
            });

            if (existingInvitation) {
                return { error: `Invitation already sent to ${email.email}` };
            }

            await Invitation.create({
                email: email.email,
                post: email.post,
                code: wantedentreprise.code,
                entreprise: wantedentreprise._id,
            });
       
            

             await transporter.sendMail({
            from: '"AYBHUB" <noreply@AybHub.com>',
            to: email.email,
            subject: `${wantedentreprise.name} invites you to work with`,
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
            
            <p>${wantedentreprise.name} sent you a request  to join their team as ${email.post}</p>
            
            <div class="otp-box">${wantedentreprise.code}</div>
            
            <p>This code is a <strong>secret code</strong> don't share it with anyone else.</p>
            
            <div class="message">
              <p><strong>Note:</strong> If you don't want  to join this company,you can safely ignore this message.</p>
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


          }))
            const newToken = jwt.sign({id:fullUser._id,
                              firstName:fullUser.firstName,
                              lastName:fullUser.lastName,
                              email:fullUser.email,
                              role:fullUser.role,
                              avatar:fullUser.avatar,
                              plan:fullUser.plan,
                              billingInfo:fullUser.billingInfo,
                              teams:fullUser.teams,
                              tasks:fullUser.tasks,
                              projects:fullUser.projects,
                              messages:fullUser.messages,
                              settings:fullUser.settings,
                              lastLogin:fullUser.lastLogin,
                              loginHistory:fullUser.loginHistory,
                              facebookId:fullUser.facebookId,
                              googleId:fullUser.googleId,
                              EntrepriseId:fullUser.EntrepriseId
          
                          },process.env.TOKEN_KEY,{expiresIn:'24h'})
                  
                  
                  
                  res.cookie('token',newToken, {
                    httpOnly: true,
                    secure: false, 
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000,
                    path: '/',
                  });
        
          
        
          res.status(201).json({message:`invitation codes has been sent successfully `,
            data:emails,
            redirectUrl:'/workspace'
          })


        
    } catch (error) {


        console.log("can't send invitation code due to this",error);
        res.status(500).json({
            message:"Can't send invitation code to emails please try again"
        })
        
        
    }
}


exports.acceptInvitationPh1 = async (req,res)=>{


    try {

        const {code,memberId}=req.body

        if(!code || !memberId){

            return res.status(400).json({
                message:"Kindlly Enter The Code!"
            })
        }

        const AddedUser = await User.findById(memberId)
        const wantedentreprise = await Entreprise.findOne({code:code})
        const validInvittion = await Invitation.findOne({email:AddedUser.email,code:code})
        if(!AddedUser || !wantedentreprise){

            return res.status(404).json({
                message:"The entreprise code is not exists or expired make sure to set correct information"
            })
        }
        if(!validInvittion){

          return res.status(404).json({
            message:"Can't find User "
          })
        }
        res.status(201).json({

            message:"Code submited successfully",
            payload:{

              companyName:wantedentreprise.name,
              post:validInvittion.post
            }
        })
        
    } catch (error) {

        console.log("Can't send infos due to this",error);
        res.status(500).json({
            message:"can't identify worker please try again"
        })
        
        
    }
}

exports.acceptInvitationPh2 = async (req, res) => {
    try {
        const { code, memberId } = req.body;

        if (!code || !memberId) {
            return res.status(400).json({
                message: "All the fields are required"
            });
        }

        const AddedUser = await User.findById(memberId);
        const wantedentreprise = await Entreprise.findOne({ code: code });
        const validInvitation = await Invitation.findOne({ 
            email: AddedUser.email, 
            code: code,
            status: { $ne: 'accepted' } // Only get non-accepted invitations
        });

        if (!AddedUser || !wantedentreprise) {
            return res.status(404).json({
                message: "The entreprise code does not exist or expired. Make sure to set correct information"
            });
        }

        if (!validInvitation) {
            return res.status(404).json({
                message: "Invalid invitation or invitation already accepted"
            });
        }

        // ✅ CHECK IF USER IS ALREADY A MEMBER
        const isAlreadyMember = wantedentreprise.workers.some(
            worker => worker.member.toString() === memberId
        );

        if (isAlreadyMember) {
            return res.status(400).json({
                message: "User is already a member of this enterprise"
            });
        }

        // ✅ CHECK IF USER ALREADY HAS AN ENTERPRISE
        if (AddedUser.EntrepriseId && AddedUser.EntrepriseId.toString() === wantedentreprise._id.toString()) {
            return res.status(400).json({
                message: "User is already part of this enterprise"
            });
        }

        // Update user's enterprise
        AddedUser.EntrepriseId = wantedentreprise._id;
        
        // Add user to enterprise workers
        const newMember = { post: validInvitation.post, member: memberId };
        wantedentreprise.workers.push(newMember);
        
        // Mark invitation as accepted
        await Invitation.findByIdAndUpdate(validInvitation._id, {
            status: 'accepted',
            user: AddedUser._id
        });

        await AddedUser.save();
        await wantedentreprise.save();

          const newToken = jwt.sign({id:AddedUser._id,
                            firstName:AddedUser.firstName,
                            lastName:AddedUser.lastName,
                            email:AddedUser.email,
                            role:AddedUser.role,
                            avatar:AddedUser.avatar,
                            plan:AddedUser.plan,
                            billingInfo:AddedUser.billingInfo,
                            teams:AddedUser.teams,
                            tasks:AddedUser.tasks,
                            projects:AddedUser.projects,
                            messages:AddedUser.messages,
                            settings:AddedUser.settings,
                            lastLogin:AddedUser.lastLogin,
                            loginHistory:AddedUser.loginHistory,
                            facebookId:AddedUser.facebookId,
                            googleId:AddedUser.googleId,
                            EntrepriseId:AddedUser.EntrepriseId
        
                        },process.env.TOKEN_KEY,{expiresIn:'24h'})
                
                
                
                res.cookie('token',newToken, {
                  httpOnly: true,
                  secure: false, 
                  sameSite: 'lax',
                  maxAge: 24 * 60 * 60 * 1000,
                  path: '/',
                });

        res.status(201).json({
            message: `Congrats ${AddedUser.firstName} you joined ${wantedentreprise.name} as ${validInvitation.post}`,
            redirectUrl: '/workspace'
        });

    } catch (error) {
        console.log("Can't accept invitation due to this", error);
        res.status(500).json({
            message: "Can't accept invitation please try again"
        });
    }
};