require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const Team = require("./models/team");
const User = require("./models/user");

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const teams = await Team.find().populate("createdBy", "name email").populate("members", "name");
        console.log("FETCH TEAMS SUCCESS:", teams);
    } catch (err) {
        console.error("FETCH TEAMS ERROR:", err);
    }
    process.exit(0);
});
