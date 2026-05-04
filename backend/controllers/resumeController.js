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

        const dataBuffer = req.file.buffer;
        const pdfData = await pdf(dataBuffer);
        const resumeText = pdfData.text.toLowerCase();

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

        // Use Regex to robustly check for links
        const githubRegex = /github\.com\/[^\s]+/i;
        const linkedinRegex = /linkedin\.com\/(?:in|profile)\/[^\s]+/i;
        const generalUrlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i;

        if (githubRegex.test(resumeText)) score += 10;
        if (linkedinRegex.test(resumeText)) score += 10;
        
        // Bonus for having other external links (like a personal portfolio)
        if (generalUrlRegex.test(resumeText) && !githubRegex.test(resumeText) && !linkedinRegex.test(resumeText)) {
            score += 5;
        }

        const finalAtsScore=Math.min(100,Math.max(0,score));

        // Convert the PDF buffer to a Base64 string for database storage
        const base64Resume = `data:application/pdf;base64,${dataBuffer.toString('base64')}`;

        user.resume=base64Resume;
        user.atsScore=finalAtsScore;
        await user.save();

        res.json({
            message:"Resume successfully parsed and uploaded!",
            resumeUrl: base64Resume,
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