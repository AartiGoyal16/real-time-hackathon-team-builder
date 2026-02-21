require("dotenv").config({path:"./config.env"});
const express=require("express");
const cors=require("cors");
const connectDB=require("./config/db");
const Message=require("./models/Message");

const http=require("http");
const {Server}=require("socket.io");

const app=express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth",require("./routes/authRoutes"));

app.use("/api/user",require("./routes/userRoutes"));

app.use("/api/team",require("./routes/teamRoutes"));

app.use("/api/message",require("./routes/messageRoutes"));

const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
});

io.on("connection",(socket)=>{
    console.log("User Connected: ",socket.id);

    socket.on("JoinTeamRoom",(teamId)=>{
        socket.join(teamId);
        console.log(`Socket ${socket.id} joined team ${teamId}`);
    });

    socket.on("sendMessage", async ({teamId,message,user})=>{
        try{
            const newMessage=await Message.create({
                teamId,
                user,
                text:message
            });

            io.to(teamId).emit("receiveMessage",newMessage);
        }
        catch(error){
            console.log("Message Save Error: ",error.message);
        }
    });

    socket.on("disconnect",()=>{
        console.log("User Disconnected: ",socket.id);
    });
});

server.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});