"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import Chat from "@/components/Chat";

type Team={
    _id: string;
    teamName: string;
    description: string;
    requiredSkills:string[];
    members:any[];
    maxMembers:number;
};

export default function TeamPage(){
    const params=useParams();
    const router=useRouter();
    const teamId=params.teamId as string;

    const [team, setTeam]=useState<Team | null>(null);
    const [loading,setLoading]=useState(true);

    const [currentUser,setCurrentUser]=useState<any>(null);
    const [joining,setJoining]=useState(false);

    useEffect(()=>{
        const userStr=localStorage.getItem("user");
        if(userStr){
            setCurrentUser(JSON.parse(userStr));
        }
    },[]);

    const fetchTeam=async()=>{
            try{
                const res=await api.get("/team/all");
                const foundTeam=res.data.find((t:Team)=>t._id===teamId);
                if(foundTeam){
                    setTeam(foundTeam);
                }
                else{
                    console.error("Team not found");
                }
            }
            catch(err){
                console.error("Failed to fetch team");
            }
            finally{
                setLoading(false);
            }
        };

    useEffect(()=>{
        fetchTeam();
    },[teamId]);

    const handleJoinTeam= async ()=> {
        if(!team || !currentUser) return;
        try{
            setLoading(true);
            await api.post(`/team/join/${team._id}`);
            alert("Successfully joined the team!");

            fetchTeam();
        }
        catch(err:any){
            alert(err.response?.data?.message || "Failed to join team.");
        }
        finally{
            setJoining(false);
        }
    };     

    if(loading){
        return <div className="p-12 text-center text-gray-500 font-mono text-sm uppercase">
            Loading Team Workspace...
        </div>;
    }

    if(!team){
        return <div className="p-12 text-center text-red-500 font-bold uppercase">
            Team Not Found.
        </div>;
    }

    const isMember=team.members.some(
        (member)=>member===currentUser?.id || member._id===currentUser?.id
    );

    const isFull=team.members.length>=team.maxMembers;

    return(
        <div className="flex flex-col flex-1 mx-8 md:mx-16 py-12 px-6">

            <div className="mb-6 flex justify-between items-center">
                <Link href="/dashboard" className="text-blue-600 font-bold text-sm hover:underline">
                    &larr; Back to Dashboard
                </Link>

                {!isMember && (
                    <button onClick={handleJoinTeam} disabled={isFull || joining} className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">
                        {joining ? "Joining...":isFull?"Team Full":"Join This Team"}
                    </button>
                )}
            </div>

            {/* Header */}
            <div className="mb-10 border-x border-t border-gray-300 p-8 bg-gray-50 shrink-0">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        {team.teamName}
                        {isMember && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded border border-green-300 uppercase tracking-widest">
                            You are a member</span>}
                    </h1>

                    <span className="text-sm font-bold bg-white text-black px-4 py-2 border border-gray-300">
                        {team.members.length}/{team.maxMembers} Members
                    </span>
                </div>

                <p className="text-gray-800 text-lg mb-6 max-w-3xl">
                    {team.description || "No description provided."}
                </p>

                {team.requiredSkills && team.requiredSkills.length>0 && (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2 self-center">Skills Needed:</span>
                        {team.requiredSkills.map((skill,idx)=>(
                            <span key={idx} className="text-xs font-bold text-black border-b-2 border-blue-600 px-1 py-0.5">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1">
                {isMember ? (
                    <Chat teamId={teamId}/>
                ):(
                    <div className="h-[400px] border border-gray-300 bg-gray-50 flex items-center justify-center flex-col p-8 text-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>

                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Team Chat is Locked
                        </h3>

                        <p className="text-gray-500 font-medium">
                            You must join this team to view and participate in the real-time chat.
                        </p>
                    </div>
                )}
            </div>
        </div>
        
    );
}