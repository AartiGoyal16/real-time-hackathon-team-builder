"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";

type Skill = {
    name: string;
    level: string;
};

type UserProfile = {
    name: string;
    email: string;
    phone: string;
    college: string;
    skills: Skill[];
    interests: string[];
    profilePic?: string;
    reputationScore: number;
    isVerified: boolean;
    followers?: string[];
    following?: string[];
    resume?: string;
    atsScore?: number;
    experience?: any[];
    feedback?: any[];
    _id?: string;
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [collegeInput, setCollegeInput] = useState("");
    const [interestsInput, setInterestsInput] = useState("");
    const [skillsInput, setSkillsInput] = useState("");
    const [picInput, setPicInput] = useState("");
    const [saving, setSaving] = useState(false);

    const [addingExp, setAddingExp] = useState(false);
    const [expForm, setExpForm] = useState({ title: "", company: "", description: "", startDate: "", endDate: "", isCurrent: false });
    const [savingExp, setSavingExp] = useState(false);

    const handleAddExperience = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSavingExp(true);
            const res = await api.post("/user/experience", expForm);
            setProfile((prev: any) => prev ? { ...prev, experience: res.data } : null);
            setAddingExp(false);
            setExpForm({ title: "", company: "", description: "", startDate: "", endDate: "", isCurrent: false });
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to add experience");
        } finally {
            setSavingExp(false);
        }
    };

    const handleDeleteFeedback = async (feedbackId: string) => {
        if (!confirm("Are you sure you want to delete this feedback?")) return;
        try {
            const res = await api.delete(`/user/feedback/${profile?._id}/${feedbackId}`);
            setProfile((prev: any) => prev ? { ...prev, feedback: res.data } : null);
            alert("Feedback deleted.");
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete feedback");
        }
    };

    const getInitials = (name: string) => {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPicInput(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get("/user/profile");
            setProfile(res.data);
            setCollegeInput(res.data.college || "");
            setPicInput(res.data.profilePic || "");
            setInterestsInput(res.data.interests?.join(", ") || "");
            setSkillsInput(res.data.skills?.map((s: Skill) => `${s.name} (${s.level})`).join(", ") || "");
        } catch (err: any) {
            console.error("Failed to load profile", err);
        } finally {
            setLoading(false);
        }
    };

    const handleResumeUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resumeFile) return alert("Please select a PDF file first");

        const formData = new FormData();
        formData.append("resume", resumeFile);

        try {
            setUploading(true);
            const res = await api.post("/user/upload-resume", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert(`Boom! Your ATS Score is ${res.data.atsScore}/100!`);
            window.location.reload();
        } catch (err: any) {
            alert(err.response?.data?.message || "Resume upload failed.");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const interestsArray = interestsInput.split(",").map(i => i.trim()).filter(i => i.length > 0);
            const skillsArray = skillsInput.split(",").map(s => {
                const parts = s.trim().split("(");
                const name = parts[0].trim();
                let level = "Beginner";
                if (parts[1]) {
                    level = parts[1].replace(")", "").trim();
                    if (!["Beginner", "Intermediate", "Advanced"].includes(level)) level = "Beginner";
                }
                return { name, level };
            }).filter(s => s.name.length > 0);

            await api.put("/user/update", {
                college: collegeInput,
                profilePic: picInput,
                interests: interestsArray,
                skills: skillsArray
            });

            alert("Profile updated successfully!");
            setIsEditing(false);
            fetchProfile();
        } catch (err: any) {
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-gray-500 font-mono text-sm uppercase animate-pulse">Loading Your Space...</div>;
    if (!profile) return <div className="p-20 text-center text-red-500 font-bold uppercase">Failed to load profile.</div>;

    return (
        <div className="flex-1 bg-gray-50 min-h-screen py-10 px-4 md:px-12 border-x border-gray-200">
            
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
                <Link href="/dashboard" className="text-gray-500 font-semibold text-sm hover:text-blue-600 flex items-center gap-2 transition-colors">
                    <span className="text-lg leading-none">&larr;</span> Back to Dashboard
                </Link>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                {!isEditing ? (
                    <div>
                        <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                                <div className="absolute top-20 left-10 w-32 h-32 bg-indigo-300 opacity-20 rounded-full blur-xl"></div>
                            </div>
                        </div>

                        <div className="px-8 pb-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 mb-8 relative z-10 gap-6">
                                
                                <div className="flex items-end gap-6">
                                    <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-lg border border-gray-100 shrink-0">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                                            {profile.profilePic ? (
                                                <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white font-black text-4xl tracking-widest">{getInitials(profile.name)}</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="pb-2">
                                        <h1 className="text-3xl font-black text-gray-900 drop-shadow-sm mb-1">
                                            {profile.name}
                                            {profile.isVerified && (
                                                <span className="ml-3 inline-block align-middle transform -translate-y-1">
                                                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 font-black rounded-full uppercase tracking-wider border border-green-200 shadow-sm">
                                                        Verified ✅
                                                    </span>
                                                </span>
                                            )}
                                        </h1>
                                        <p className="text-blue-600 font-semibold text-sm">
                                            {profile.email} <span className="text-gray-300 mx-2">|</span> <span className="text-gray-500">{profile.phone}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-full text-sm hover:bg-gray-200 transition-colors shadow-sm focus:ring-2 focus:ring-gray-300">
                                        Edit Profile
                                    </button>
                                </div>
                            </div>

                            {/* STATISTICS ROW */}
                            <div className="grid grid-cols-3 gap-4 mb-10 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <div className="text-center border-r border-gray-200">
                                    <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Followers</span>
                                    <span className="block text-2xl font-black text-gray-900">{profile.followers?.length || 0}</span>
                                </div>
                                <div className="text-center border-r border-gray-200">
                                    <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Following</span>
                                    <span className="block text-2xl font-black text-gray-900">{profile.following?.length || 0}</span>
                                </div>
                                <div className="text-center relative">
                                    <span className="block text-teal-500 text-[10px] uppercase font-bold tracking-widest mb-1">Reputation</span>
                                    <span className="block text-2xl font-black text-teal-600">
                                        {profile.reputationScore} <span className="text-teal-300 text-sm">XP</span>
                                    </span>
                                </div>
                            </div>

                            {/* PORTFOLIO & RESUME (ATS MODULE) */}
                            <div className="mb-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                                    <h2 className="text-xl font-black text-gray-900">Professional Portfolio</h2>
                                </div>

                                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
                                    {profile.resume ? (
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                            
                                            {profile.atsScore !== null && profile.atsScore !== undefined && (
                                                <div className="flex items-center gap-4 bg-gradient-to-br from-gray-50 to-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
                                                    <div className={`w-14 h-14 flex items-center justify-center rounded-full border-4 inset-shadow-sm ${
                                                        profile.atsScore >= 80 ? 'border-green-400 text-green-500 bg-green-50' : profile.atsScore >= 50 ? 'border-yellow-400 text-yellow-500 bg-yellow-50' : 'border-red-400 text-red-500 bg-red-50'
                                                    }`}>
                                                        <span className="text-xl font-black">{profile.atsScore}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] font-black text-gray-900 uppercase tracking-widest">ATS AI Score</span>
                                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Automated Rating</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                                <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}${profile.resume}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-blue-50 text-blue-700 border border-blue-200 px-6 py-3 font-bold text-sm rounded-full hover:bg-blue-600 hover:text-white hover:border-transparent transition-all shadow-sm flex items-center justify-center gap-2">
                                                    📄 View My Resume
                                                </a>

                                                <form onSubmit={handleResumeUpload} className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                                                    <label className="w-full sm:w-auto cursor-pointer bg-white border border-gray-200 text-gray-700 px-6 py-3 text-sm font-bold shadow-sm rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                                        Re-Upload
                                                        <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="hidden"/>
                                                    </label>
                                                    
                                                    {resumeFile && (
                                                        <button type="submit" disabled={uploading} className={`w-full sm:w-auto px-6 py-3 font-bold text-white text-sm rounded-full shadow-md transition-transform transform hover:-translate-y-0.5 ${uploading ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
                                                            {uploading ? "Scanning..." : "Sync Score"}
                                                        </button>
                                                    )}
                                                </form>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <span className="text-2xl">📄</span>
                                            </div>
                                            <h4 className="text-lg font-black text-gray-900 mb-2">Upload Your PDF Resume</h4>
                                            <p className="text-xs font-medium text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
                                                Our AI evaluates your PDF against your listed skills and formatting metrics to generate a live ATS Compatibility Score out of 100.
                                            </p>
                                            <form onSubmit={handleResumeUpload} className="flex flex-col sm:flex-row justify-center items-center gap-3">
                                                <label className="cursor-pointer bg-blue-50 text-blue-700 px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm rounded-full flex items-center gap-2">
                                                    Select Resume PDF
                                                    <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="hidden"/>
                                                </label>
                                                
                                                {resumeFile && (
                                                    <div className="flex items-center gap-3 animate-in slide-in-from-left-4 duration-300">
                                                        <span className="text-[10px] font-bold text-gray-500 max-w-[150px] truncate bg-gray-100 px-3 py-1.5 rounded-full">{resumeFile.name}</span>
                                                        <button type="submit" disabled={uploading} className={`px-5 py-2.5 font-black text-white text-[10px] uppercase tracking-wider rounded-full shadow-md transition-colors ${uploading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}`}>
                                                            {uploading ? "Scanning..." : "Calculate ATS"}
                                                        </button>
                                                    </div>
                                                )}
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                
                                <div className="space-y-6">
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                            Education / Organization
                                        </h3>
                                        <p className="font-bold text-lg text-gray-900">{profile.college || <span className="text-gray-400 italic font-medium">Not Specified</span>}</p>
                                    </div>

                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                                            Passionate Interests
                                        </h3>
                                        {profile.interests && profile.interests.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {profile.interests.map((int, i) => (
                                                    <span key={i} className="bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 rounded-lg">
                                                        {int}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : <p className="font-medium text-gray-400 text-sm italic">No interests specified yet.</p>}
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8 flex-1">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                            Verified Technical Skills
                                        </h3>
                                        <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Used by AI Matcher</span>
                                    </div>

                                    {profile.skills && profile.skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {profile.skills.map((skill, i) => (
                                                <div key={i} className="group flex items-center justify-between border border-gray-200 bg-white rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all">
                                                    <div className="px-4 py-2.5 bg-gray-50 border-r border-gray-200 group-hover:bg-blue-50 transition-colors">
                                                        <span className="font-black text-sm text-gray-900 group-hover:text-blue-700">{skill.name}</span>
                                                    </div>
                                                    <div className="px-4 py-2.5 flex items-center">
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                                            skill.level === "Advanced" ? "text-purple-600" : skill.level === "Intermediate" ? "text-blue-500" : "text-gray-500"
                                                        }`}>
                                                            {skill.level}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="font-medium text-gray-400 text-sm italic mb-4">You haven't added any programming skills.</p>
                                            <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest underline decoration-blue-200 hover:decoration-blue-500 transition-all underline-offset-4">
                                                Add Skills Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* EXPERIENCE TIMELINE */}
                            <div className="mt-8 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                        Professional Experience
                                    </h3>
                                    <button onClick={() => setAddingExp(true)} className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full transition-colors tracking-widest">+ Add Role</button>
                                </div>

                                {addingExp && (
                                    <form onSubmit={handleAddExperience} className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <input required placeholder="Job Title" value={expForm.title} onChange={e=>setExpForm({...expForm, title:e.target.value})} className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"/>
                                            <input required placeholder="Company / Organization" value={expForm.company} onChange={e=>setExpForm({...expForm, company:e.target.value})} className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"/>
                                            <div className="flex flex-col">
                                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 ml-1">Start Date</label>
                                                <input required type="date" value={expForm.startDate} onChange={e=>setExpForm({...expForm, startDate:e.target.value})} className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-gray-700"/>
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex justify-between items-center mb-1 ml-1">
                                                    <label className="text-[10px] uppercase font-bold text-gray-500">End Date</label>
                                                    <label className="flex items-center gap-1 text-[10px] font-bold text-gray-600 cursor-pointer">
                                                        <input type="checkbox" checked={expForm.isCurrent} onChange={e=>setExpForm({...expForm, isCurrent:e.target.checked})}/> Current
                                                    </label>
                                                </div>
                                                <input type="date" disabled={expForm.isCurrent} value={expForm.endDate} onChange={e=>setExpForm({...expForm, endDate:e.target.value})} className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-gray-700 disabled:opacity-50"/>
                                            </div>
                                        </div>
                                        <textarea placeholder="Description of your accomplishments..." value={expForm.description} onChange={e=>setExpForm({...expForm, description:e.target.value})} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium mb-4 min-h-[80px]"/>
                                        <div className="flex gap-3 justify-end">
                                            <button type="button" onClick={() => setAddingExp(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 uppercase tracking-widest">Cancel</button>
                                            <button type="submit" disabled={savingExp} className="px-6 py-2 bg-blue-600 hover:bg-black text-white rounded-lg text-xs font-black uppercase tracking-widest shadow transition-colors disabled:opacity-50">Save</button>
                                        </div>
                                    </form>
                                )}

                                {profile.experience && profile.experience.length > 0 ? (
                                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                        {profile.experience.map((exp: any, i: number) => (
                                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                                    💼
                                                </div>
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100 group-hover:border-blue-200 transition-colors">
                                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                                        <div className="font-black text-gray-900 text-sm">{exp.title}</div>
                                                        <time className="font-bold text-blue-600 text-[10px] uppercase tracking-widest">{new Date(exp.startDate).toLocaleDateString(undefined,{month:'short', year:'numeric'})} - {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined,{month:'short', year:'numeric'}) : ''}</time>
                                                    </div>
                                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{exp.company}</div>
                                                    <div className="text-xs text-gray-600 font-medium leading-relaxed">{exp.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="font-medium text-gray-400 text-sm italic text-center py-4">No professional experience listed.</p>
                                )}
                            </div>

                            {/* FEEDBACK SECTION */}
                            <div className="mt-8 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Peer Feedback
                                    </h3>
                                </div>
                                
                                {profile.feedback && profile.feedback.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {profile.feedback.map((fb: any, i: number) => (
                                            <div key={i} className="bg-gray-50 border border-gray-100 p-4 rounded-xl shadow-sm group relative overflow-hidden">
                                                <div className="flex items-center gap-3 mb-3 border-b border-gray-200 pb-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden shrink-0">
                                                        {fb.sender?.profilePic ? <img src={fb.sender.profilePic} className="w-full h-full object-cover"/> : <span className="text-xs font-bold text-white">{fb.sender?.name?.charAt(0)}</span>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-xs font-bold text-gray-900">{fb.sender?.name || "Anonymous"}</div>
                                                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(fb.date).toLocaleDateString()}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, idx) => (
                                                                <span key={idx} className={`text-sm ${idx < fb.rating ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                                                            ))}
                                                        </div>
                                                        <button onClick={() => handleDeleteFeedback(fb._id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">🗑️</button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-700 italic font-medium leading-relaxed">"{fb.text}"</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="font-medium text-gray-400 text-sm italic text-center py-4">No peer feedback yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative bg-white">
                        
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Refine Your Identity</h2>
                            <p className="text-gray-500 font-medium text-sm">Make sure your details are up-to-date so recruiters and hackers can find you.</p>
                        </div>

                        <div className="space-y-8 max-w-2xl mx-auto">
                            
                            {/* Avatar Section */}
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                <label className="block text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Avatar / Profile Photo</label>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 shrink-0">📁</div>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs font-bold file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer w-full"/> 
                                    </div>
                                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-500 shrink-0">🔗</div>
                                        <input type="url" value={picInput.startsWith("data:image") ? "" : picInput} onChange={e => setPicInput(e.target.value)} className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-sm font-semibold text-gray-800 placeholder-gray-300" placeholder="Or paste an image URL (e.g. imgur.com/avatar.jpg)"/>
                                    </div>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">College / Organization</label>
                                <input type="text" value={collegeInput} onChange={e => setCollegeInput(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-900 transition-all placeholder-gray-300" placeholder="E.g. Massachusetts Institute of Technology" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Hackathon Fields (Comma separated)</label>
                                <input type="text" value={interestsInput} onChange={e =>  setInterestsInput(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold text-gray-900 transition-all placeholder-gray-300" placeholder="E.g. AI Prompting, Web Dev, UX Design"/>
                            </div>

                            {/* Skills Builder */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100/50 shadow-inner">
                                <label className="flex items-center gap-2 text-[10px] font-black text-indigo-800 mb-2 uppercase tracking-widest">
                                    <span className="text-base leading-none">⚡</span> Technical Skills Matrix
                                </label>
                                <p className="text-xs text-indigo-600/80 mb-4 font-medium leading-relaxed">
                                    Format: <strong className="text-indigo-900 bg-white px-1.5 py-0.5 rounded shadow-sm">Skill (Level)</strong> separated by commas.<br/>
                                    Valid metrics: <strong>Beginner, Intermediate, Advanced</strong>.
                                </p>
                                <textarea rows={3} value={skillsInput} onChange={e => setSkillsInput(e.target.value)} className="w-full p-4 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 font-bold text-gray-900 resize-none shadow-sm placeholder-gray-300 transition-all text-sm leading-relaxed" placeholder="E.g. React (Intermediate), Python 3 (Advanced), Figma (Beginner)"/>
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 mt-8">
                                <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black tracking-widest uppercase text-sm py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                                    {saving ? "Saving Changes..." : "Save Identity"}
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="px-10 bg-white border-2 border-gray-200 text-gray-600 font-bold tracking-widest uppercase text-sm py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all">
                                    Cancel
                                </button>
                            </div>

                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}