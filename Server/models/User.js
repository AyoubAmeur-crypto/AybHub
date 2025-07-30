const mongoose = require("mongoose")
const User = new mongoose.Schema({

    firstName:{

        type:String,
        required:true,
        trim:true
    },
    lastName:{

        type:String,
        required:true,
        trim:true
    },

    email:{

        type:String,
        required:true,
        unique:true,
        },
    password:{


        type:String,
        required:false,
        default:null,
        select:false
    },
     provider: {
    type: String,
    enum: ['local', 'google','facebook'],
    default: 'local'
  },
    role:{

        type:String,
        enum:['admin','manager','worker','solo'],
    },
    teamLink:{

        type:String,
        default:''
    },
    avatar:{

        type:String,
        default:null

    },
    plan:{

        type:String,
        enum:['free','pro','entreprise'],
        default:'free'
    },
    billingInfo:{

        type:mongoose.Schema.Types.ObjectId,
        ref:'billing'
    },
    teams:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Team'
    },
    tasks:{

        type:mongoose.Schema.Types.ObjectId,
        ref:'Task',
    },
    projects:[{

        type:mongoose.Schema.Types.ObjectId,
        ref:'ProjectV2'
    }],
    EntrepriseId:{

        type:mongoose.Schema.Types.ObjectId,
        ref:'Entreprise'
    },
    messages:[{

        type:mongoose.Schema.Types.ObjectId,
        ref:'Message'
    }],settings:{

        darkMode:{type:Boolean,default:false},
        language:{type:String,enum:['en','fr'],default:'en'}
    },
    lastLogin:{

        date:{
            type:Date,
            default:Date.now

        },
        ip:{

            type:String
        }
    },
    loginHistory:[{

          date:{
            type:Date,
            default:Date.now

        },
        ip:{

            type:String
        }

        
    }],
    facebookId:{

        type:String,
        unique:true,
        sparse:true
    },
     googleId:{

        type:String,
        unique:true,
        sparse:true
    }


},{timestamps:true})



module.exports = mongoose.model("User",User)