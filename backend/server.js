require("dotenv").config({path:"./config.env"});
const express=require("express");
const cors=require("cors");
const connectDB=require("./config/db");

const http=require("http");
const {Server}=require("socket.io");

const app=express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth",require("./routes/authRoutes"));

app.use("/api/user",require("./routes/userRoutes"));

app.use("/api/team",require("./routes/teamRoutes"));

const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
});

app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});