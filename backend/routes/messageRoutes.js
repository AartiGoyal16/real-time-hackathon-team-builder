const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:teamId", authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            teamId: req.params.teamId,
            deletedForUsers: { $ne: req.user._id }
        })
            .populate("user", "name email")
            .sort({ createdAt: 1 });

        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:messageId", authMiddleware, async (req, res) => {
    try {
        const { deleteType } = req.body;
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (deleteType === "me") {
            if (!message.deletedForUsers.includes(req.user._id)) {
                message.deletedForUsers.push(req.user._id);
                await message.save();
            }
            return res.json({ message: "Message deleted for me", messageId: req.params.messageId });
        }

        const Team = require("../models/team");
        const team = await Team.findById(message.teamId);

        const isMessageAuthor = message.user.toString() === req.user._id.toString();
        const isTeamAdmin = team && team.createdBy.toString() === req.user._id.toString();

        if (!isMessageAuthor && !isTeamAdmin) {
            return res.status(403).json({ message: "Not authorized to delete this message" });
        }

        if (deleteType === "everyone") {
            message.deletedForEveryone = true;
            message.deletedByRole = isMessageAuthor ? "author" : "admin";
            await message.save();
            return res.json({ message: "Message deleted for everyone", messageId: req.params.messageId });
        }

        await message.deleteOne();
        res.json({ message: "Message deleted successfully", messageId: req.params.messageId });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;