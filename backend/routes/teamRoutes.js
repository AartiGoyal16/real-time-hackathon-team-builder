const express=require("express");
const router=express.Router();
const authMiddleware=require("../middleware/authMiddleware");
const {createTeam,getAllTeams,joinTeam,leaveTeam,endTeam,recommendedTeams,markTeamAsWon}=require("../controllers/teamController");

router.post("/create",authMiddleware,createTeam);
router.get("/all",authMiddleware,getAllTeams);
router.post("/join/:teamId",authMiddleware,joinTeam);
router.post("/leave/:teamId",authMiddleware,leaveTeam);
router.delete("/:teamId",authMiddleware,endTeam);
router.get("/recommend",authMiddleware,recommendedTeams);
router.post("/:teamId/win",authMiddleware,markTeamAsWon);

module.exports=router;