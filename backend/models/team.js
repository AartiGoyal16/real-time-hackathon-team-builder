//to store team details

const mongoose=require("mongoose");

const teamSchema=new mongoose.Schema({

    teamName:{
        type:String,
        required:true
    },

    description:{
        type:String
    },

    requiredSkills:[
        {
            type:String
        }
    ],

    members:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"hackTeamUser"   //in user.js model name created by object
        }
    ],

    maxMembers:{
        type:Number,
        default:4
    },

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"hackTeamUser"
    },

    createdAt:{
        type:Date,
        default:Date.now
    },

    hasWon:{
        type:Boolean,
        default:false
    }

},{timestamps:true});

module.exports=mongoose.model("Team",teamSchema);