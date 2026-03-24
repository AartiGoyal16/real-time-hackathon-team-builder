const express=require("express");
const router=express.Router();
const DirectMessage=require("../models/DirectMessage");
const User=require("../models/user");
const authMiddleware=require("../middleware/authMiddleware");

router.get("/users",authMiddleware,async(req,res)=>{
    try{
        const users=await User.find({_id:{$ne:req.user._id}}).select("name email profilePic reputationScore college atsScore isVerified");
        res.json(users);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.get("/conversations",authMiddleware,async(req,res)=>{
    try{
        const userId=req.user._id.toString();

        const messages=await DirectMessage.find({
            $or:[{sender:userId},{receiver:userId}],
            deletedForUsers:{$ne:userId}
        })
        .sort({createdAt:-1})
        .populate("sender","name profilePic")
        .populate("receiver","name profilePic");

        const convos=new Map();

        for(const msg of messages){
            if (!msg.sender || !msg.receiver) continue; 
            const isSender=msg.sender._id.toString()===userId;
            const partner=isSender?msg.receiver:msg.sender;
            const partnerId=partner._id.toString();

            if(!convos.has(partnerId)){
                convos.set(partnerId,{
                    partnerId:partner._id,
                    name:partner.name,
                    profilePic: partner.profilePic,
                    snippet:msg.deletedForEveryone?"Deleted message":msg.text,
                    isMine:isSender,
                    time:msg.createdAt,
                    unreadCount:(!isSender && !msg.isRead)?1:0
                });
            }
            else{
                if(!isSender && !msg.isRead){
                    const convo=convos.get(partnerId);
                    convo.unreadCount+=1;
                }
            }
        }

        const sortedConvos=Array.from(convos.values());

        res.json(sortedConvos);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.get("/:userId",authMiddleware,async(req,res)=>{
    try{
        await DirectMessage.updateMany(
            {sender:req.params.userId,receiver:req.user._id,isRead:{$ne:true}},
            {$set:{isRead:true}}
        );

        const messages=await DirectMessage.find({
            $or:[
                {sender:req.user._id, receiver: req.params.userId},
                {sender:req.params.userId, receiver:req.user._id}
            ],
            deletedForUsers:{$ne: req.user._id}
        }).sort({createdAt:1});

        res.json(messages);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

router.delete("/:messageId",authMiddleware,async(req,res)=>{
    try{
        const {deleteType}=req.body;
        const msg=await DirectMessage.findById(req.params.messageId);

        if(!msg) return res.status(404).json({message:"Message not found"});

        if(deleteType==="me"){
            msg.deletedForUsers.push(req.user._id);
            await msg.save();
            return res.json({message:"Deleted for you"});
        }
        else if(deleteType==="everyone"){
            if(msg.sender.toString()!==req.user._id.toString()){
                return res.status(403).json({message:"Only the sender can delete for everyone"});
            }

            msg.deletedForEveryone=true;
            await msg.save();
            return res.json({message:"Deleted for everyone"});
        }
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

module.exports=router;