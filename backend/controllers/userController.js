const User=require("../models/user");

//get profile
exports.getProfile=async(req,res)=>{
    try{
        const user=await User.findById(req.user.id).select("-password");
        res.json(user);
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
};

//update profile
exports.updateProfile=async(req,res)=>{
    try{
        const{skills,interests,profilePic,college}=req.body;

        const updateUser=await User.findByIdAndUpdate(
            req.user.id,
            {skills,interests,profilePic,college},
            {new:true}
        ).select("-password");

        res.json(updateUser);
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
};