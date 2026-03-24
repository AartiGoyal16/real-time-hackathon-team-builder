// User Schema to register
const mongoose=require("mongoose");

//for skill schema
const skillSchema=new mongoose.Schema({
    name:{
        type:String,
        requied:true
    },
    level:{
        type:String,
        enum:["Beginner","Intermediate","Advanced"],
        default:"Beginner"
    }
});

//for user schema
const userSchema=new mongoose.Schema({

    name:{
        type:String,
        required:true,
        trim:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    phone:{
        type:String,
        unique:true,
        required:true
    },

    password:{
        type:String,
        required:true,
    },

    college:{
        type:String
    },

    skills:[skillSchema],

    interests:[
        {
            type:String
        }
    ],

    reputationScore:{
        type:Number,
        default:0
    },

    profilePic:{
        type:String,
        default:""
    },

    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"hackTeamUser"
    }],

    following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"hackTeamUser"
    }],

    experience:[{
        title: {
            type:String,required:true
        },

        company:{
            type:String,
            required:true
        },

        description:{
            type:String
        },

        startDate:{
            type:Date
        },

        endDate:{
            type:Date
        },

        isCurrent:{
            type:Boolean,
            default:false
        }
    }],

    certificates:[{
        name:{
            type:String,
            required:true
        },

        link:{
            type:String
        },

        dateIssued:{
            type:Date
        }
    }],

    feedback:[{
        sender:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"hackTeamUser"
        },

        text:{
            type:String,
            required:true
        },

        rating:{
            type:Number,
            min:1,
            max:5
        },

        date:{
            type:Date,
            default:Date.now
        }
    }],

    resume:{
        type:String,
        default:null
    },

    atsScore:{
        type:Number,
        default:null
    },

    isVerified:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const userModel=mongoose.model("hackTeamUser",userSchema);
module.exports=userModel;