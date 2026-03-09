const express=require("express");
const router=express.Router();
const Message=require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:teamId",authMiddleware,async (req,res)=>{
    try{
        const messages=await Message.find({
            teamId: req.params.teamId
        })
        .populate("user","name email")
        .sort({createdAt:1});

        res.json(messages);
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
});

router.delete("/:messageId",authMiddleware,async(req,res)=>{
    try{
        const message=await Message.findById(req.params.messageId);

        if(!message){
            return res.status(404).json({message:"Message not found"});
        }

        if(message.user.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"Not authorized to delete this message"});
        }

        await message.deleteOne();
        res.json({message:"Message deleted successfully",messageId:req.params.messageId});
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
});

module.exports=router;