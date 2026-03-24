"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Conversation={
    partnerId:string;
    name:string;
    profilePic?:string;
    snippet:string;
    isMine:boolean;
    time:string;
    unreadCount: number;
};

export default function MessageHub(){
    const router=useRouter();
    const [conversations,setConversations]=useState<Conversation[]>([]);
    const [loading,setLoading]=useState(true);

    useEffect(()=>{
        const fetchConvos=async()=>{
            try{
                setLoading(true);
                const res=await api.get(`/dm/conversations?t=${Date.now()}`);
                setConversations(res.data);
            }
            catch(err:any){
                if(err.response?.status===401){
                    localStorage.removeItem("user");
                    window.location.href="/login";
                }
                console.error("Failed to load conversations");
            }
            finally{
                setLoading(false);
            }
        };
        fetchConvos();
    },[]);

    const getInitials=(name:string)=>{
        if(!name) return "?";
        return name.split(" ").map(n=>n[0]).join("").substring(0,2).toUpperCase();
    };

    const formatTime=(dateString:string)=>{
        const date=new Date(dateString);
        return date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    };

    // if(loading){
    //     return <div className="p-12 text-center text-gray-500 font-mono text-sm uppercase">Loading Users...</div>
    // }

    return(
        <div className="flex-1 border-x border-gray-300 mx-8 md:mx-16 py-12 px-6">
            <h1 className="text-4xl font-black tracking-tight mb-2">
                Your <span className="text-blue-600">Messages</span>
            </h1>

            <p className="text-gray-600 font-medium mb-10">
                Continue your active hackathon discussions here.
            </p>

            <div className="max-w-3xl flex flex-col gap-2">
                {loading?(
                    <div className="p-8 text-center text-gray-500 font-mono text-sm uppercase font-bold border border-gray-200 bg-gray-50">
                        Loading chats...
                    </div>
                ):conversations.length===0?(
                    <div className="border border-gray-300 p-12 text-center bg-gray-50">
                        <h3 className="font-black text-gray-600 mb-2">
                            No conversations yet!
                        </h3>

                        <p className="text-sm text-gray-400 mb-6">
                            Go to the Hacker Directory or Dashboard to start networking.
                        </p>

                        <Link href="/users" className="bg-blue-600 text-white px-6 py-3 font-bold text-sm hover:bg-black transition-colors shadow-sm">
                            Find Hackers
                        </Link>
                    </div>
                ):(
                    conversations.map((convo,idx)=>(
                        <Link href={`/messages/${convo.partnerId}`} key={idx} className={`flex items-center gap-4 border p-4 transition-colors shadow-sm cursor-pointer group ${convo.unreadCount>0? "bg-green-50/50 border-green-200 hover:bg-green-100": "bg-white border-gray-200 hover:bg-gray-50"}`}>
                            <div className="w-16 h-16 rounded-full bg-blue-600 overflow-hidden flex items-center justify-center shrink-0 shadow-sm border-4 border-transparent group-hover:border-blue-100 transition-colors">
                                {convo.profilePic?(
                                    <img src={convo.profilePic} alt="Profile" className="w-full h-full object-cover"/>
                                ):(
                                    <span className="text-white font-black text-2xl tracking-widest shadow-sm">
                                        {getInitials(convo.name)}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 pr-2">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h2 className={`text-lg truncate pr-4 transition-colors ${convo.unreadCount>0?"font-black text-black":"font-bold text-gray-700 group-hover:text-blue-600"}`}>
                                        {convo.name}
                                    </h2>

                                    <span className={`text-[10px] uppercase tracking-widest whitespace-nowrap ${convo.unreadCount>0?"font-black text-green-600":"font-bold text-gray-400"}`}>
                                        {formatTime(convo.time)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <p className={`text-sm truncate ${convo.unreadCount>0?"font-bold text-black border-l-2 border-green-400 pl-2":"font-semibold text-gray-500"}`}>
                                        {convo.isMine && (
                                            <span className="text-gray-400 font-bold tracking-wide mr-1 border border-gray-200 bg-gray-50 px-1 rounded-sm text-[10px] uppercase">
                                                You 
                                            </span>
                                        )}
                                        {convo.snippet}
                                    </p>

                                    {convo.unreadCount>0 && (
                                        <div className="flex items-center justify-center bg-green-500 text-white w-6 h-6 rounded-full text-xs font-black shadow-sm shrink-0 animate-bounce duration-300">
                                            {convo.unreadCount>99 ? "99+":convo.unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user=>(
                    <Link key={user._id} href={`/messages/${user._id}`} className="block border border-gray-300 p-6 bg-gray-50 hover:bg-white transition group shadow-sm hover:shadow-md">
                        <h2 className="text-xl font-bold text-black mb-1">{user.name}</h2>

                        <p className="text-xs font-semibold text-gray-500 mb-6">{user.email}</p>

                        <div className="border-t border-gray-200 pt-4 mt-auto">
                            <span className="inline-block text-xs font-bold text-white uppercase tracking-widest bg-black px-4 py-2 hover:bg-blue-600 transition-colors">
                                Message &rarr;
                            </span>
                        </div>
                    </Link>
                ))}
            </div> */}
        </div>
    );
}