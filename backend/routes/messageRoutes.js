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

module.exports=router;