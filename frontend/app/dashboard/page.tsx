"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

type Team = {
    _id: string;
    teamName: string;
    description: string;
    requiredSkills: string[];
    members: any[];
    maxMembers: number;
};

export default function Dashboard() {
    const [teamName, setTeamName] = useState("");
    const [description, setDescription] = useState("");
    const [skillsInput, setSkillsInput] = useState("");
    const [creating, setCreating] = useState(false);
    const [createMsg, setCreateMsg] = useState({ type: "", text: "" });

    const [teams, setTeams] = useState<Team[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(true);

    const fetchTeams = async () => {
        try {
            setLoadingTeams(true);
            const res = await api.get("/team/all");
            setTeams(res.data);
        }
        catch (err: any) {
            console.error("Failed to fetch teams");
            if (err.response?.status === 401) {
                localStorage.removeItem("user");
                window.location.href = "/login";
            }
        }
        finally {
            setLoadingTeams(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);
            setCreateMsg({ type: "", text: "" });

            const requiredSkills = skillsInput.split(",").map((s) => s.trim()).filter((s) => s.length > 0);

            await api.post("/team/create", {
                teamName,
                description,
                requiredSkills,
            });

            setCreateMsg({ type: "success", text: "Team created successfully!" });
            setTeamName("");
            setDescription("");
            setSkillsInput("");

            fetchTeams();
        }
        catch (err: any) {
            setCreateMsg({
                type: "error",
                text: err.response?.data?.message || "Failed to create team.",
            });
        }
        finally {
            setCreating(false);
        }
    };

    const handleJoinTeam = async (teamId: string) => {
        try {
            await api.post(`/team/join/${teamId}`);
            alert("Successfully joined the team!");
            fetchTeams();
        }
        catch (err: any) {
            alert(err.response?.data?.message || "Failed to join team.");
        }
    };

    return (
        <div className="flex-1 border-x border-gray-300 mx-8 md:mx-16 py-12 px-6">

            {/* Header */}
            <div className="mb-12 border-b border-gray-300 pb-6">
                <h1 className="text-4xl font-black tracking-tight mb-2">
                    Hackathon <span className="text-blue-600">Dashboard</span>
                </h1>

                <p className="text-gray-600 font-medium">
                    Build your own team or join an existing one.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">

                {/* Create team form */}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-h h-4 bg-black block"></span>
                        Create a Team
                    </h2>

                    <div className="border border-gray-300 p-8 bg-gray-50/50">
                        {createMsg.text && (
                            <div className={`p-3 mb-6 text-sm font-semibold rounded border ${createMsg.type === "success" ? "bg-green-50 border-green-500 text-green-700" : "bg-red-50 border-red-500 text-red-600"}`}>
                                {createMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleCreateTeam}>
                            <div className="mb-5">
                                <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wide">
                                    Team Name
                                </label>

                                <input type="text" required placeholder="E.g., The Innovators..." className="w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                            </div>

                            <div className="mb-5">
                                <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wide">
                                    Project Description
                                </label>

                                <textarea rows={3} placeholder="What is your team building?..." className="w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>

                            <div className="mb-8">
                                <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wide">
                                    Required Skills (Comma seperated)
                                </label>

                                <input type="text" placeholder="React, Node.js, Design..." className="w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} />
                            </div>

                            <button type="submit" disabled={creating} className="w-full bg-black text-white py-3 font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors">
                                {creating ? "Creating..." : "Create Team"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Join Team List */}
                <div className="flex-1 lg:max-w-xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-4 h-4 bg-blue-600 block"></span>
                        Join a Team
                    </h2>

                    <div className="border border-gray-300 divide-y divide-gray-300">
                        {loadingTeams ? (
                            <div className="p-8 text-cengter text-gray-500 font-medium font-mono text-sm uppercase">
                                Loading Teams...
                            </div>
                        ) : teams.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 font-medium">
                                No teams available yet. Be the first to create one!
                            </div>
                        ) : (
                            teams.map((team) => (
                                <div key={team._id} className="p-6 bg-white hover:bg-gray-50 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-black">
                                            {team.teamName}
                                        </h3>

                                        <span className="text-xs font-bold bg-gray-100 text-gray-800 px-2 py-1 border border-gray-300">
                                            {team.members.length}/
                                            {team.maxMembers} Members
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {team.description || "No description provided."}
                                    </p>

                                    {team.requiredSkills && team.requiredSkills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {team.requiredSkills.map((skill, idx) => (
                                                <span key={idx} className="text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <Link href={`/team/${team._id}`} className="block text-center w-full border-2 border-black text-black py-2 text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-black">
                                        View & Chat
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}