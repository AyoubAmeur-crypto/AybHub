const NewsLetter = require("../models/NewsLetter")


exports.AddMailToNewsLetter = async (req,res)=>{

    try {

        const {email}=req.body

        if(!email){

            return res.status(400).json({
                success:false,
                message:'must have an email to continue'
            })
            
        }

        const checkEmailIfExist = await NewsLetter.findOne({email:email})

        if(checkEmailIfExist){

            return res.status(400).json({
                success:false,
                message:'Email already exists!'
            })
        }

        await NewsLetter.create({email:email})

            res.status(201).json({
                 success:true,
                 message:'Email has been regestred Successfuly to NewsLetter'
            })


        
    } catch (error) {

        console.log("can't add email to newsletter due to this",error);

        res.status(500).json({

            success:false,
            message:"Can't add email for the moment please try again"
        })
        
        
    }
}