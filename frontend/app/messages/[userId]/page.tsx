"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";
import api from "@/lib/api";
import Link from "next/link";
import { text } from "stream/consumers";

type DM={
    _id:string;
    sender:string;
    receiver:string;
    text:string;
    createdAt: string;
    deletedForEveryone?:boolean;
};

export default function DirectMessagePage(){
    const params=useParams();
    const router=useRouter();
    const targetUserId=params.userId as string;

    const [messages,setMessages]=useState<DM[]>([]);
    const [newMessage, setNewMessage]= useState("");
    const [notification,setNotification]=useState("");
    const [currentUser,setCurrentUser]=useState<any>(null);
    const [targetUser, setTargetUser]=useState<any>(null);
    const [loading,setLoading]=useState(true);

    const socketRef=useRef<Socket | null>(null);
    const messagesEndRef=useRef<HTMLDivElement>(null);

    const scrollToBottom=()=>{
        setTimeout(()=>{
            messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
        },100);
    };

    const showNotification=(text:string)=>{
        setNotification(text);
        setTimeout(()=> setNotification(""),3000);
    };

    useEffect(()=>{
        const userStr=localStorage.getItem("user");
        if(userStr){
            setCurrentUser(JSON.parse(userStr));
        }
        else{
            router.push("/login");
            return;
        }

        const fetchChatData=async()=>{
            try{
                const usersRes=await api.get("/dm/users");
                const target=usersRes.data.find((u:any)=>u._id===targetUserId);

                if(target) setTargetUser(target);

                const historyRes=await api.get(`/dm/${targetUserId}`);
                setMessages(historyRes.data);
                scrollToBottom();
            }
            catch(err:any){
                console.error("Failed to load private chat",err);
            }
            finally{
                setLoading(false);
            }
        };
        fetchChatData();
    },[targetUserId,router]);

    useEffect(()=>{
        if(!currentUser) return;

        socketRef.current=io("http://localhost:5000",{
            withCredentials:true
        });

        const socket=socketRef.current;

        socket.on("connect",()=>{
            socket.emit("registerUser",currentUser.id);
        });

        socket.on("receiveDirectMessage",(msg:any)=>{
            setMessages((prev)=>[...prev,msg]);
            scrollToBottom();

            if(currentUser && msg.sender !== currentUser.id){
                showNotification("New message!");
            }
        });

        socket.on("directMessageDeleted",({messageId,deleteType})=>{
            if(deleteType==="everyone"){
                setMessages((prev)=>prev.map((m)=>m._id===messageId?{...m, deletedForEveryone: true}:m));
            }
        });

        return ()=>{socket.disconnect();};
    },[currentUser,targetUserId]);

    const handleSendMessage=(e:React.FormEvent)=>{
        e.preventDefault();

        if(!newMessage.trim() || !socketRef.current || !currentUser) return;

        socketRef.current.emit("sendDirectMessage",{
            receiverId: targetUserId,
            text: newMessage,
        });

        setNewMessage("");
    };

    const handleDeleteMessage=async(messageId:string,isSender:boolean)=>{
        let deleteType="me";

        if(isSender){
            const result=window.prompt('Type "me" to Delete for You, or "everyone" to Delete for Everyone','me');

            if(result==="everyone") deleteType="everyone";
            else if(result==="me") deleteType="me";
            else return;
        }
        else{
            if(!window.confirm("Delete this message for yourself?")) return;
        }

        try{
            await api.delete(`/dm/${messageId}`,{data:{deleteType}});

            if(deleteType==="me"){
                setMessages((prev)=>prev.filter((msg)=>msg._id!==messageId));
            }
            else{
                setMessages((prev)=>prev.map((msg)=>msg._id===messageId?{...msg,deletedForEveryone:true}:msg));

                socketRef.current?.emit("deleteDirectMessage",{
                    receiverId:targetUserId,
                    messageId:messageId,
                    deleteType:"everyone"
                });
            }
        }
        catch(err){
            alert("Failed to delete message");
        }
    };

    if(loading || !targetUser) return <div className="p-12 text-center text-gray-500 font-mono text-sm uppercase">
        Loading Secure Connection...
    </div>;

    return(
        <div className="flex flex-col flex-1 mx-8 md:mx-16 py-12 px-6">
            <div className="mb-6">
                <Link href="/messages" className="text-blue-600 font-bold text-sm hover:underline">
                    &larr; Back to Messages Hub
                </Link>
            </div>

            <div className="flex flex-col h-[600px] border border-gray-300 bg-white shadow-sm relative">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-300 bg-gray-50 flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>

                    <h3 className="font-bold text-lg text-black">
                        Chat with <span className="text-blue-600">{targetUser.name}</span>
                    </h3>
                </div>

                {/* Temporary Floating Notification */}
                {notification && (
                    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg z-10 animate-fade-in">
                        {notification}
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-gray-50/30">
                    {messages.length===0 && (
                        <div className="text-center text-gray-400 text-sm mt-10">
                            No messages yet. Say hello!
                        </div>
                    )}

                    {messages.map((msg,idx)=>{
                        const isMine=msg.sender===currentUser.id;
                        
                        return(
                            <div key={msg._id || idx} className={`flex flex-col max-w-[80%] ${isMine? "self-end":"self-start"}`}>
                                <div className={`flex items-baseline gap-2 mb-1 ${isMine ? "justify-end":"justify-start"}`}>
                                    <span className="text-[10px] font-bold uppercase text-gray-400">
                                        {isMine?"You":targetUser?.name || "Them"}
                                    </span>

                                    <button onClick={()=>handleDeleteMessage(msg._id,isMine)} className="text-[10px] text-gray-400 hover:text-red-700 font-bold uppercase transition">
                                        Delete
                                    </button>
                                </div>
                                
                                <div className={`px-4 py-3 text-sm shadow-sm ${msg.deletedForEveryone? "bg-gray-100 text-gray-500 italic rounded-xl border border-gray-200":(isMine? "bg-blue-600 text-white rounded-l-xl rounded-tr-xl":"bg-white border border-gray-200 text-black rounded-r-xl rounded-tl-xl")}`}>
                                    {msg.deletedForEveryone?"This message was deleted":msg.text}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef}/>
                </div>

                {/* Input form */}
                <div className="border-t border-gray-300 p-4 bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input type="text" placeholder="Type your message..." value={newMessage} onChange={(e)=>setNewMessage(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"/>

                        <button type="submit" disabled={!newMessage.trim()} className="px-6 py-3 bg-black text-white font-bold uppercase text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
}