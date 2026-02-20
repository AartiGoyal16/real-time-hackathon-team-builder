//routes of getProfile and update

const express=require("express");
const router=express.Router();
const authMiddleware=require("../middleware/authMiddleware");
const {getProfile,updateProfile}=require("../controllers/userController");

router.get("/profile",authMiddleware,getProfile);
router.put("/update",authMiddleware,updateProfile);

module.exports=router;