"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

export default function PublicProfile(){
    const params = useParams();
    const targetUserId = params.userId as string;

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showResumeModal, setShowResumeModal] = useState(false);
    
    // Feedback State
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({ text: "", rating: 5 });
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmittingFeedback(true);
            const res = await api.post(`/user/feedback/${targetUserId}`, feedbackForm);
            setProfile((prev: any) => prev ? { ...prev, feedback: res.data } : null);
            setShowFeedbackModal(false);
            setFeedbackForm({ text: "", rating: 5 });
            alert("Feedback posted successfully!");
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to submit feedback");
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const handleDeleteFeedback = async (feedbackId: string) => {
        if (!confirm("Are you sure you want to delete your feedback?")) return;
        try {
            const res = await api.delete(`/user/feedback/${targetUserId}/${feedbackId}`);
            setProfile((prev: any) => prev ? { ...prev, feedback: res.data } : null);
            alert("Feedback deleted.");
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete feedback");
        }
    };

    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublicProfile = async () => {
            try {
                const res = await api.get(`/user/public/${targetUserId}`);
                setProfile(res.data);
                setFollowersCount(res.data.followers?.length || 0);
                setFollowingCount(res.data.following?.length || 0);

                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const me = JSON.parse(userStr);
                    setCurrentUserId(me.id);
                    
                    if (res.data.followers?.includes(me.id)) {
                        setIsFollowing(true);
                    }
                }
            } catch (err) {
                console.error("Failed to load public profile");
            } finally {
                setLoading(false);
            }
        };
        fetchPublicProfile();
    }, [targetUserId]);

    const handleFollow = async () => {
        try {
            await api.post(`/user/follow/${targetUserId}`);

            if (isFollowing) {
                setIsFollowing(false);
                setFollowersCount(prev => prev - 1);
            } else {
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
            }
        } catch (err) {
            alert("Failed to follow user. Please try again.");
        }
    };

    const getInitials = (name: string) => {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    if (loading) return (
        <div className="p-12 text-center text-gray-500 font-mono text-sm uppercase">
             Loading Hacker Profile...
        </div>
    );

    if (!profile) return (
        <div className="p-12 text-center text-red-500 font-bold uppercase">
             Hacker Not Found
        </div>
    );

    return (
        <div className="flex-1 border-x border-gray-300 mx-8 md:mx-16 py-12 px-6">
            <div className="mb-8 flex justify-between items-center">
                <Link href="/users" className="text-blue-600 font-bold text-sm hover:underline">
                    &larr; Back to Directory
                </Link>
            </div>

            <div className="border border-gray-300 p-8 bg-white w-full max-w-3xl shadow-sm">
                <div className="mb-8 flex flex-col md:flex-row gap-8 items-start">
                    
                    <div className="w-32 h-32 rounded-full bg-blue-600 border-4 border-blue-50 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                        {profile.profilePic ? (
                            <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover"/>
                        ) : (
                            <span className="text-white font-black text-4xl tracking-widest shadow-sm">
                                {getInitials(profile.name)}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 mt-2">
                        <h2 className="text-4xl font-black mb-2 text-black">
                            {profile.name}
                        </h2>

                        <p className="text-gray-500 font-bold text-lg mb-4">
                            {profile.email}
                        </p>

                        <div className="flex gap-6 font-bold text-sm mb-6">
                            <div className="flex flex-col">
                                <span className="text-2xl text-black leading-none">{followersCount}</span>
                                <span className="text-gray-400 uppercase tracking-widest text-[10px]">Followers</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl text-black leading-none">{followingCount}</span>
                                <span className="text-gray-400 uppercase tracking-widest text-[10px]">Following</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {currentUserId && currentUserId !== targetUserId && (
                                <button 
                                    onClick={handleFollow}
                                    className={`px-8 py-3 rounded font-black text-xs uppercase tracking-wider transition-colors shadow-sm border-2 ${
                                        isFollowing 
                                        ? "bg-white text-black border-black hover:bg-gray-100" 
                                        : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                    }`}
                                >
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                            )}

                            <Link href={`/messages/${profile._id}`} className="bg-black border-2 border-black text-white px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm rounded">
                                Message
                            </Link>
                            
                            {profile.isVerified && (
                                <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs px-3 py-1 font-bold rounded border border-green-300 uppercase tracking-wider mt-1 md:mt-0">
                                    Verified Hacker
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="text-center border border-gray-200 bg-gray-50 p-4 min-w-[120px] rounded shrink-0">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Reputation
                        </div>

                        <div className="text-4xl font-black text-blue-600">
                            {profile.reputationScore || 0}
                        </div>
                    </div>

                    {profile.resume && (
                        <div className="flex flex-col items-center border border-gray-200 bg-white p-4 min-w-[140px] rounded shadow-sm shrink-0 mt-4 md:mt-0 md:ml-4">
                            <button onClick={() => setShowResumeModal(true)} type="button" className="text-[10px] font-black text-white hover:text-white uppercase tracking-widest mb-2 bg-blue-600 hover:bg-gray-800 transition-colors px-2 py-2 flex items-center gap-2 rounded shadow-sm w-full justify-center cursor-pointer">
                                📄 View Resume Only
                            </button>

                            {profile.atsScore !== null && profile.atsScore!==undefined && (
                                <div className="flex items-center gap-3 w-full justify-center mt-2">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-full border-4 shadow-inner bg-gray-50 ${profile.atsScore >= 80 ? 'border-green-400 text-green-600' : profile.atsScore >= 50 ? 'border-yellow-400 text-yellow-600' : 'border-red-400 text-red-600'}`}>
                                        <span className="text-xl font-black">
                                            {profile.atsScore}
                                        </span>
                                    </div>

                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest leading-none">
                                            ATS Score
                                        </span>

                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                            Out of 100
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-t border-gray-200 pt-8 bg-gray-50/50 p-6">
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                            College / University
                        </h3>
                        <p className="font-semibold text-lg text-black">
                            {profile.college || "Not specified"}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                            Interests
                        </h3>
                        {profile.interests && profile.interests.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.interests.map((int: string, i: number) => (
                                    <span key={i} className="bg-white border border-gray-300 px-3 py-1 text-xs font-bold text-gray-700 rounded shadow-sm">
                                        {int}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="font-semibold text-gray-400 text-sm italic">Not specified</p>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 pl-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
                        Verified Skills
                    </h3>

                    {profile.skills && profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-4">
                            {profile.skills.map((skill: any, i: number) => (
                                <div key={i} className="bg-white border border-gray-300 px-4 py-3 min-w-[120px] text-center shadow-sm rounded">
                                    <div className="font-bold text-sm mb-1 text-black">
                                        {skill.name}
                                    </div>
                                    <div className={`text-[10px] font-bold uppercase tracking-wider ${skill.level === "Advanced" ? "text-yellow-600" : skill.level === "Intermediate" ? "text-blue-600" : "text-gray-400"}`}>
                                        {skill.level}
                                    </div>
                                </div> 
                            ))}
                        </div>
                    ) : (
                        <p className="font-semibold text-gray-400 text-sm italic">This Hacker hasn't added any skills yet.</p>
                    )}
                </div>

                {/* EXPERIENCE TIMELINE */}
                <div className="border-t border-gray-200 pt-8 mt-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-6">
                        Professional Experience
                    </h3>
                    
                    {profile.experience && profile.experience.length > 0 ? (
                        <div className="space-y-6 px-6 md:px-12 relative before:absolute before:inset-0 before:ml-11 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                            {profile.experience.map((exp: any, i: number) => (
                                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        💼
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100 transition-colors">
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
                        <p className="font-semibold text-gray-400 text-sm italic px-6">No professional experience listed.</p>
                    )}
                </div>

                {/* FEEDBACK SECTION */}
                <div className="border-t border-gray-200 pt-8 mt-8 bg-gray-50/50 rounded-b-3xl">
                    <div className="px-6 pb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Peer Feedback
                            </h3>
                            {currentUserId && currentUserId !== targetUserId && (
                                <button onClick={() => setShowFeedbackModal(true)} type="button" className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-4 py-2 rounded shadow-sm hover:bg-blue-600 transition-colors">
                                    Leave Feedback
                                </button>
                            )}
                        </div>
                        
                        {profile.feedback && profile.feedback.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.feedback.map((fb: any, i: number) => {
                                    const isMyFeedback = currentUserId && (fb.sender?._id === currentUserId || fb.sender === currentUserId);
                                    return (
                                        <div key={i} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm relative group overflow-hidden">
                                            <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-3">
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
                                                            <span key={idx} className={`text-sm ${idx < fb.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                                                        ))}
                                                    </div>
                                                    {isMyFeedback && (
                                                        <button onClick={() => handleDeleteFeedback(fb._id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">🗑️</button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-700 italic font-medium leading-relaxed">"{fb.text}"</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="font-semibold text-gray-400 text-sm italic">No peer feedback yet.</p>
                        )}
                    </div>
                </div>
                
            </div>
            
            {showResumeModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4 md:p-12 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl h-full rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-black text-gray-800 uppercase tracking-widest text-sm">Resume View Only</h3>
                            <button onClick={() => setShowResumeModal(false)} type="button" className="text-gray-500 hover:text-red-500 font-black px-4 py-2 bg-gray-200 hover:bg-red-100 rounded">
                                ✕ CLOSE
                            </button>
                        </div>
                        <div className="flex-1 w-full bg-gray-100" onContextMenu={(e) => e.preventDefault()}>
                            <iframe 
                                src={`http://localhost:5000${profile.resume}#toolbar=0&navpanes=0&scrollbar=0`} 
                                className="w-full h-full border-none pointer-events-auto"
                            />
                        </div>
                    </div>
                </div>
            )}

            {showFeedbackModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
                    <form onSubmit={handleFeedbackSubmit} className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-black text-gray-900 text-xl font-mono">Leave Feedback</h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">Share your experience collaborating with {profile.name.split(" ")[0]}.</p>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1,2,3,4,5].map(star => (
                                        <button key={star} type="button" onClick={() => setFeedbackForm({...feedbackForm, rating: star})} className={`text-2xl transition-all ${star <= feedbackForm.rating ? "text-yellow-400 hover:scale-110" : "text-gray-200 hover:text-yellow-200"}`}>
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your Review</label>
                                <textarea required value={feedbackForm.text} onChange={e => setFeedbackForm({...feedbackForm, text: e.target.value})} placeholder="They were a fantastic teammate..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium min-h-[120px] resize-none"></textarea>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowFeedbackModal(false)} className="px-5 py-2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest">Cancel</button>
                            <button type="submit" disabled={submittingFeedback} className="px-6 py-2 bg-black hover:bg-blue-600 text-white rounded shadow-sm text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50">Post Review</button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}