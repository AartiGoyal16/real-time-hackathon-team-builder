const User=require("../models/user");

//get profile
exports.getProfile=async(req,res)=>{
    try{
        const user=await User.findById(req.user.id).populate("feedback.sender", "name profilePic").select("-password");
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

exports.getPublicProfile=async (req,res)=>{
    try{
        const user=await User.findById(req.params.userId).populate("feedback.sender", "name profilePic").select("-password -phone");

        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.json(user);
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
}

exports.toggleFollow=async(req,res)=>{
    try{
        const targetUserId=req.params.userId;
        const currentUserId=req.user._id;

        if(targetUserId===currentUserId.toString()){
            return res.status(400).json({message:"You cannot follow yourself"});
        }

        const targetUser=await User.findById(targetUserId);
        const currentUser=await User.findById(currentUserId);

        if(!targetUser || !currentUser) return res.status(404).json({message:"User not found"});

        const isFollowing=currentUser.following.includes(targetUserId);

        if(isFollowing){
            currentUser.following=currentUser.following.filter(id=>id.toString()!==targetUserId);
            targetUser.followers=targetUser.followers.filter(id=>id.toString()!==currentUserId.toString());
        }
        else{
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
        }

        await currentUser.save();
        await targetUser.save();

        res.json({message: isFollowing?"Unfollowed":"Followed successfully"});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
};

exports.addExperience = async (req, res) => {
    try {
        const { title, company, description, startDate, endDate, isCurrent } = req.body;
        const user = await User.findById(req.user.id);
        
        user.experience.unshift({
            title, company, description, startDate, endDate, isCurrent
        });
        
        await user.save();
        res.json(user.experience);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addFeedback = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const { text, rating } = req.body;
        
        if (targetUserId === req.user.id) {
            return res.status(400).json({ message: "You cannot review yourself." });
        }
        
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ message: "User not found." });
        
        const existingReview = targetUser.feedback.find(f => f.sender && f.sender._id?.toString() === req.user.id.toString());
        if (existingReview) {
            return res.status(400).json({ message: "You have already left feedback for this hacker." });
        }
        
        targetUser.feedback.push({
            sender: req.user.id,
            text,
            rating: parseInt(rating)
        });
        
        targetUser.reputationScore += (parseInt(rating) * 5);
        
        await targetUser.save();
        await targetUser.populate("feedback.sender", "name profilePic");
        
        res.json(targetUser.feedback);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteFeedback = async (req, res) => {
    try {
        const { targetUserId, feedbackId } = req.params;
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ message: "User not found." });

        const feedbackIndex = targetUser.feedback.findIndex(f => f._id.toString() === feedbackId);
        if (feedbackIndex === -1) return res.status(404).json({ message: "Feedback not found." });

        const feedback = targetUser.feedback[feedbackIndex];
        const senderIdStr = feedback.sender?._id?.toString() || feedback.sender?.toString();

        if (req.user.id !== targetUserId && req.user.id !== senderIdStr) {
            return res.status(403).json({ message: "Not authorized to delete this feedback." });
        }

        targetUser.reputationScore -= (feedback.rating * 5);
        targetUser.feedback.splice(feedbackIndex, 1);

        await targetUser.save();
        await targetUser.populate("feedback.sender", "name profilePic");

        res.json(targetUser.feedback);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};