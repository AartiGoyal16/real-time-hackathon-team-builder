//routes of register and login

const express=require("express");
const router=express.Router();
const {registerUser,loginUser, logoutUser, forgotPassword, resetPassword, googleLogin}=require("../controllers/authController");

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/logout",logoutUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/google", googleLogin);


module.exports=router;