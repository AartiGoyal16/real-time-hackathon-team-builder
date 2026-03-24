const User=require("../models/user");
const pdf=require("pdf-parse");
const fs=require("fs");
const path=require("path");

exports.uploadAndScoreResume=async(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({message:"No PDF file detected!"});
        }

        const user=await User.findById(req.user.id);
        if(!user) return res.status(404).json({message:"User not found"});

        const resumeUrl=`/uploads/${req.file.filename}`;
        const physicalPath=path.join(__dirname,"../",req.file.path);

        const dataBuffer=fs.readFileSync(physicalPath);
        const pdfData=await pdf(dataBuffer);
        const resumeText=pdfData.text.toLowerCase();

        let score=0;
        let matchedSkills=0;

        const userSkills=user.skills.map(s=>s.name.toLowerCase());
        if(userSkills.length>0){
            userSkills.forEach(skill=>{
                if(resumeText.includes(skill)) matchedSkills++;
            });
            score+=Math.min(40,Math.floor((matchedSkills/userSkills.length)*40));
        }
        else{
            score+=20;
        }

        const wordCount=resumeText.split(/\s+/).length;
        if(wordCount>250 && wordCount<1500) score+=20;

        const actionVerbs=["managed","designed","created","led","engineered","developed","built","spearheaded"];
        let verbsFound=0;
        actionVerbs.forEach(verb=>{
            if(resumeText.includes(verb)) verbsFound++;
        });
        score+=Math.min(20,verbsFound*5);

        if(resumeText.includes("github.com")) score+=10;
        if(resumeText.includes("linkedin.com")) score+=10;

        const finalAtsScore=Math.min(100,Math.max(0,score));

        user.resume=resumeUrl;
        user.atsScore=finalAtsScore;
        await user.save();

        res.json({
            message:"Resume successfully parsed and uploaded!",
            resumeUrl,
            atsScore: finalAtsScore,
            metrics:{
                wordCount,
                matchedSkills
            }
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({message:err.message||"Server crashed parsing the PDF Resume."});
    }
};