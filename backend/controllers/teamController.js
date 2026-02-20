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

exports.recommendedTeams=async(req,res)=>{
    try{
        const userSkills=req.user.skills.map(s=>s.name);

        const teams=await Team.find();

        const recommended=teams.filter(team=>{
            const matchCount=team.requiredSkills.filter(skill=> userSkills.includes(skill)).length;

            return matchCount>0;
        });

        res.json(recommended);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}