//routes of getProfile and update

const express=require("express");
const router=express.Router();
const authMiddleware=require("../middleware/authMiddleware");
const {getProfile,updateProfile,getPublicProfile,toggleFollow,addExperience,addFeedback,deleteFeedback}=require("../controllers/userController");
const upload=require("../middleware/upload");
const resumeController=require("../controllers/resumeController");

router.get("/profile",authMiddleware,getProfile);
router.put("/update",authMiddleware,updateProfile);
router.get("/public/:userId",authMiddleware,getPublicProfile);
router.post("/follow/:userId",authMiddleware,toggleFollow);
router.post("/upload-resume",authMiddleware,upload.single("resume"),resumeController.uploadAndScoreResume);
router.post("/experience",authMiddleware,addExperience);
router.post("/feedback/:userId",authMiddleware,addFeedback);
router.delete("/feedback/:targetUserId/:feedbackId",authMiddleware,deleteFeedback);

module.exports=router;