const multer=require("multer");
const fs=require("fs");
const path=require("path");

const uploadDir=path.join(__dirname,"../uploads");
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"uploads/");
    },
    filename:(req,file,cb)=>{
        const uniqueSuffix=Date.now()+"-"+Math.round(Math.random()*1E9);
        cb(null,uniqueSuffix+"-"+file.originalname.replace(/\s+/g,'-'));
    }
});

const upload=multer({
    storage,
    limits:{
        fileSize:5*1024*1024
    },
    fileFilter:(req,file,cb)=>{
        if(file.mimetype==="application/pdf"){
            cb(null,true);
        }
        else{
            cb(new Error("Only PDF files are allowed for your Resume!"));
        }
    }
});

module.exports=upload;