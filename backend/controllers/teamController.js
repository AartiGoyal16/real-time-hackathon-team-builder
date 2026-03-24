// to create team, get team, join team, leave team

const Team=require("../models/team");

exports.createTeam=async(req,res)=>{
    try{
        const team=await Team.create({
            teamName:req.body.teamName,
            description:req.body.description,
            requiredSkills:req.body.requiredSkills,
            members:[req.user._id],
            createdBy:req.user._id
        });

        res.json(team);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
};

exports.getAllTeams=async (req,res)=>{
    try{
        const teams=await Team.find()
        .populate("createdBy","name email")
        .populate("members","name");

        res.json(teams);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
};

exports.joinTeam=async (req,res)=>{
    try{
        const team=await Team.findById(req.params.teamId);

        if(!team){
            return res.status(404).json({message:"Team not found"});
        }

        if(team.members.includes(req.user._id)){
            return res.status(400).json({message:"Already joined"});
        }

        if(team.members.length>=team.maxMembers){
            return res.status(400).json({message:"Team is full"});
        }

        team.members.push(req.user._id);
        await team.save();

        res.json({message:"Joined successfully",team});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
};

exports.leaveTeam=async (req,res)=>{
    try{
        const team=await Team.findById(req.params.teamId);

        if(!team){
            return res.status(404).json({message:"Team not found"});
        }

        if(team.createdBy.toString()===req.user._id.toString()){
            return res.status(400).json({message:"Creators cannot leave the team, they must end it instead."});
        }

        team.members=team.members.filter(
            (member)=>member.toString()!==req.user._id.toString()
        );

        await team.save();

        res.json({message:"Left team successfully",team});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
};

exports.endTeam=async(req,res)=>{
    try{
        const team=await Team.findById(req.params.teamId);

        if(!team){
            return res.status(404).json({message:"Team not found"});
        }

        if(team.createdBy.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"Only the creator can end the team"});
        }

        await team.deleteOne();

        const Message=require("../models/Message");
        await Message.deleteMany({teamId:req.params.teamId});

        res.json({message:"Team ended and all messages wiped successfully."});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}

exports.recommendedTeams=async(req,res)=>{
    try{
        const userSkills=req.user.skills || [];

        const teams=await Team.find();

        const scoredTeams=teams.map(team => {
            let score=0;
            const requiredSkillsLower=team.requiredSkills.map(s=>s.toLowerCase());

            const maxPossibleScore=team.requiredSkills.length*20;

            userSkills.forEach(userSkill => {
                const uName=userSkill.name.toLowerCase();
                const uLevel=userSkill.level;

                let weight=1;
                if(uLevel==="Intermediate") weight=1.5;
                if(uLevel==="Advanced") weight=2;

                if(requiredSkillsLower.includes(uName)){
                    score+=10*weight;
                }
                else{
                    const partialMatch=requiredSkillsLower.some(reqSkill=>reqSkill.includes(uName) || uName.includes(reqSkill));

                    if(partialMatch){
                        score+=5*weight;
                    }
                }
            });

            let matchPercentage=0;
            if(maxPossibleScore>0){
                matchPercentage=Math.min(Math.round((score/maxPossibleScore) *100),100);
            }

            return{
                ...team.toObject(),
                compatibilityScore:score,
                matchPercentage: matchPercentage
            };
        });

        const relevantTeams=scoredTeams.filter(t=>t.matchPercentage>0);

        relevantTeams.sort((a,b)=>b.matchPercentage-a.matchPercentage);

        res.json(relevantTeams);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}

exports.markTeamAsWon = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) return res.status(404).json({ message: "Team not found." });

        if (team.createdBy.toString() !== req.user.id.toString() && team.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the Team Creator can mark the team as a winner." });
        }

        if (team.hasWon) {
            return res.status(400).json({ message: "This team has already been marked as a winner!" });
        }

        const User = require("../models/user");

        const allMemberIds = [team.createdBy, ...team.members];

        for (let memberId of allMemberIds) {
            const member = await User.findById(memberId);
            if (member) {
                member.reputationScore = (member.reputationScore || 0) + 500;
                
                member.experience.unshift({
                    title: "Hackathon Winner 🏆",
                    company: team.teamName,
                    description: `Achieved victory at a hackathon alongside an incredible team. Built and shipped a winning project!`,
                    startDate: new Date(),
                    endDate: new Date(),
                    isCurrent: false
                });

                await member.save();
            }
        }

        team.hasWon = true;
        await team.save();

        res.json({ message: "Team marked as won! All members received +500 XP and a Winner Badge on their profile!", team });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};