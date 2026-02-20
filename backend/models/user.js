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

    isVerified:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const userModel=mongoose.model("hackTeamUser",userSchema);
module.exports=userModel;