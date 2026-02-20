//to verify user

const jwt=require("jsonwebtoken");
const User=require("../models/user");

const authMiddleware=async (req,res,next)=>{
    const token=req.headers.authorization;

    if(!token){
        return res.status(401).json({message:"No token provided"});
    }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await User.findById(decoded.id).select("-password");

        req.user=user;
        next();
    }
    catch(err){
        return res.status(401).json({message:"Invalid token"});
    }
};

module.exports=authMiddleware;
