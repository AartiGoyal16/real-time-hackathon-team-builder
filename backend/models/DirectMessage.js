const mongoose=require("mongoose");

const dmSchema=new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"hackTeamUser",
        required:true
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"hackTeamUser",
        required:true
    },
    text:{
        type:String,
        required:true
    },
    deletedForEveryone:{
        type:Boolean,
        default:false
    },
    deletedForUsers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"hackTeamUser"
    }],
    isRead:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

module.exports=mongoose.model("DirectMessage",dmSchema);