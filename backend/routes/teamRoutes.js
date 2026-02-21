const express=require("express");
const router=express.Router();
const authMiddleware=require("../middleware/authMiddleware");
const {createTeam,getAllTeams,joinTeam,leaveTeam,recommendedTeams}=require("../controllers/teamController");

router.post("/create",authMiddleware,createTeam);
router.get("/all",authMiddleware,getAllTeams);
router.post("/join/:teamId",authMiddleware,joinTeam);
router.post("/leave/:teamId",authMiddleware,leaveTeam);
router.get("/recommend",authMiddleware,recommendedTeams);

module.exports=router;