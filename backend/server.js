require("dotenv").config({ path: "./config.env" });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
connectDB();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/user", require("./routes/userRoutes"));

app.use("/api/team", require("./routes/teamRoutes"));

app.use("/api/message", require("./routes/messageRoutes"));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.use((socket, next) => {
    try {
        const cookies = socket.request.headers.cookie;
        if (!cookies) return next(new Error("Authentication Error"));

        const token = cookie.parse(cookies).token;

        if (!token) {
            return next(new Error("Authentication Error"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;

        next();
    }
    catch (err) {
        next(new Error("Authentication Error"));
    }
})

io.on("connection", (socket) => {
    console.log("Authenticated socket:", socket.userId);

    socket.on("JoinTeamRoom", (teamId) => {
        socket.join(teamId);
        console.log(`Socket ${socket.id} joined team ${teamId}`);
    });

    socket.on("sendMessage", async ({ teamId, message }) => {
        try {
            const newMessage = await Message.create({
                teamId,
                user: socket.userId,
                text: message,
            });

            const populatedMessage = await Message.findById(newMessage._id).populate("user", "name email");

            io.to(teamId).emit("receiveMessage", populatedMessage);
        }
        catch (error) {
            console.log("Message Save Error: ", error.message);
        }
    });

    socket.on("deleteMessage", async ({ teamId, messageId }) => {
        io.to(teamId).emit("messageDeleted", messageId);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected: ", socket.id);
    });
});

server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});