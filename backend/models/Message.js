const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "hackTeamUser",
            required: true,
        },

        text: {
            type: String,
            required: true,
        },

        deletedForEveryone: {
            type: Boolean,
            default: false,
        },

        deletedByRole: {
            type: String,
            enum: ["author", "admin", null],
            default: null,
        },

        deletedForUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "hackTeamUser",
        }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);