// to hash password and save user if not exist and login
const User=require("../models/user");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

//register user
exports.registerUser=async(req,res)=>{
    try{
        const {name,email,phone,password}=req.body;

        const existingUser=await User.findOne({email});
        if(existingUser) return res.status(400).json({message:"User already exists"});

        const hashedPassword=await bcrypt.hash(password,10);

        const user=new User({
            name,
            email,
            phone,
            password:hashedPassword
        });

        await user.save();

        res.status(201).json({message:"User Registered Successfully"});
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
};

//login user
exports.loginUser=async (req,res)=>{
    try{
        const {email,password}=req.body;

        const user=await User.findOne({email});
        if(!user) return res.status(404).json({message:"User Not found"});

        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(404).json({message:"Invalid email or password"});

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{
            expiresIn:"7d"
        });

        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite:"lax",
            maxAge:7*24*60*60*1000,
        });

        res.status(200).json({
            message:"Login successful",
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
            },
        });
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
};

exports.logoutUser=(req,res)=>{
    res.clearCookie("token");
    res.json({message:"Logged out successfully"});
};