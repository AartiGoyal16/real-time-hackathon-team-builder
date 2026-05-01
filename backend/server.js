require("dotenv").config({ path: "./config.env" });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const path=require("path");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT=process.env.PORT||5000;
connectDB();

const allowedOrigins = [
    "http://localhost:3000",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET","POST","PUT","DELETE"]
    })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads",express.static(path.join(__dirname,"uploads")));

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/user", require("./routes/userRoutes"));

app.use("/api/team", require("./routes/teamRoutes"));

app.use("/api/message", require("./routes/messageRoutes"));

app.use("/api/dm",require("./routes/dmRoutes"));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
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

    socket.on("deleteMessage", async ({ teamId, messageId, deleteType, deletedByRole }) => {
        io.to(teamId).emit("messageDeleted", { messageId, deleteType, deletedByRole });
    });

    socket.on("registerUser",(userId)=>{
        socket.join(userId);
        console.log(`Socket ${socket.id} registered for private DMs: ${userId}`);
    });

    socket.on("sendDirectMessage", async({receiverId,text})=>{
        try{
            const DirectMessage=require("./models/DirectMessage");
            const newMsg=await DirectMessage.create({
                sender:socket.userId,
                receiver:receiverId,
                text:text
            });

            io.to(receiverId).emit("receiveDirectMessage",newMsg);

            io.to(socket.userId).emit("receiveDirectMessage",newMsg);
        }
        catch(err){
            console.error("DM Save Error:",err.message);
        }
    });

    socket.on("deleteDirectMessage",async({receiverId,messageId,deleteType})=>{
        io.to(receiverId).emit("directMessageDeleted",{messageId,deleteType});
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected: ", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
