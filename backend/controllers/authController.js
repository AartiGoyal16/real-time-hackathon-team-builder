// to hash password and save user if not exist and login
const User=require("../models/user");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


//register user
exports.registerUser=async(req,res)=>{
    try{
        const {name,email,phone,password}=req.body;
                // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if(!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters, contain an uppercase letter, a lowercase letter, a number, and a special character."
            });
        }


        const existingUser=await User.findOne({email});
        if(existingUser) return res.status(400).json({message:"User already exists"});

        const user=new User({
            name,
            email,
            phone,
            password
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

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
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

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: "No user found with this email" });

        // Generate a random token
        const resetToken = crypto.randomBytes(20).toString("hex");

        // Hash it before saving to database (Security best practice)
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes

        await user.save();

        // Send email
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const message = `You are receiving this email because you requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({ email: user.email, subject: "Password Reset Token", message });
            res.status(200).json({ message: "Email Sent Successfully" });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            res.status(500).json({ message: "Email could not be sent", error: error.message });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
    try {
        // Hash the token attached to the URL to compare it against the database
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

        // Validate new password string
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if(!passwordRegex.test(req.body.password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters, contain an uppercase letter, a lowercase letter, a number, and a special character."
            });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// GOOGLE AUTH
exports.googleLogin = async (req, res) => {
    try {
        const { googleToken } = req.body;
        
        // Verify token with google servers
        const ticket = await googleClient.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        
        // Ensure email exists from google payload
        if (!payload || !payload.email) return res.status(400).json({ message: "Invalid google payload" });

        let user = await User.findOne({ email: payload.email });

        // If user doesn't exist, sign them up automatically using their Google details!
        if (!user) {
            user = new User({
                name: payload.name,
                email: payload.email,
                phone: `google-${payload.sub}`, // Google doesn't always provide a phone number, give a dummy dummy unique one 
                profilePic: payload.picture,
                authProvider: "google" 
                // Password is skipped due to the conditional rule we added to the model
            });
            await user.save();
        }

        // Generate JWT (Same logic as standard login)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "Google Authentication successful",
            user: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic },
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
