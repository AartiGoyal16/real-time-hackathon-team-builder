"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function UsersDirectory() {
    const [users, setUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get("/dm/users");
                // Sort users by reputation for the "Stories" section
                const sortedUsers = res.data.sort((a: any, b: any) => (b.reputationScore || 0) - (a.reputationScore || 0));
                setUsers(sortedUsers);

                const history = JSON.parse(localStorage.getItem("hackerSearchHistory") || "[]");
                setSearchHistory(history);
            } catch (err: any) {
                console.error("Failed to fetch users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;

        // Ensure unique history and cap at 5
        const newHistory = [query, ...searchHistory.filter(h => h.toLowerCase() !== query.toLowerCase())].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem("hackerSearchHistory", JSON.stringify(newHistory));
    };

    const handleHistoryClick = (query: string) => {
        setSearchQuery(query);
    };

    const removeHistoryItem = (queryToRemove: string) => {
        const newHistory = searchHistory.filter(h => h !== queryToRemove);
        setSearchHistory(newHistory);
        localStorage.setItem("hackerSearchHistory", JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem("hackerSearchHistory");
    };

    const isSearching = searchQuery.trim() !== "";

    // The Top Hackers act as Instagram "Stories"
    const recommendedUsers = users.slice(0, 8);

    const filteredUsers = users.filter((user: any) => {
        const query = searchQuery.toLowerCase();
        return user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
    });

    const getInitials = (name: string) => {
        if (!name) return "?";
        return name.split(" ").map((n: any) => n[0]).join("").substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex-1 min-h-screen bg-gray-50 pb-20">
            {/* STICKY TOP NAVIGATION BAR (Instagram Explore Style) */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-4 md:px-8 shadow-sm">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h1 className="text-2xl font-black tracking-tight text-gray-900 drop-shadow-sm italic">
                        Explore <span className="text-blue-600 not-italic">Hackers</span>
                    </h1>
                    
                    <form onSubmit={handleSearch} className="w-full sm:w-96 relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-lg">🔍</span>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all text-gray-800 placeholder-gray-400 group-hover:bg-gray-200" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button type="button" onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 text-sm font-bold">
                                ✕
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6">
                    
                    {/* SEARCH HISTORY PILLS */}
                    {searchHistory.length > 0 && !isSearching && (
                        <div className="mb-8 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-gray-900">Recent Searches</span>
                                <button onClick={clearHistory} className="text-[11px] text-blue-600 font-bold hover:underline">
                                    Clear All
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {searchHistory.map((h, i) => (
                                    <div key={i} className="flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                                        <button 
                                            type="button" 
                                            onClick={() => handleHistoryClick(h)} 
                                            className="text-xs font-semibold text-gray-700 truncate max-w-[120px]"
                                        >
                                            {h}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => removeHistoryItem(h)} 
                                            className="ml-1 text-gray-400 hover:text-red-500 text-[10px] w-4 h-4 flex items-center justify-center bg-gray-50 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* INSTAGRAM "STORIES" - RECOMMENDED HACKERS */}
                    {!isSearching && recommendedUsers.length > 0 && (
                        <div className="mb-10">
                            <h2 className="text-sm font-bold text-gray-900 mb-4 px-1 flex items-center gap-2">
                                <span className="flex w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                                Top Hackers
                            </h2>
                            {/* Horizontal scrollable row */}
                            <div className="flex overflow-x-auto gap-4 pb-4 px-1 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {recommendedUsers.map((user) => (
                                    <Link key={user._id} href={`/profile/${user._id}`} className="flex flex-col items-center gap-2 group w-20 shrink-0 cursor-pointer">
                                        <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-sm group-hover:scale-105 transition-transform">
                                            <div className="w-full h-full rounded-full border-2 border-white bg-blue-600 overflow-hidden flex items-center justify-center">
                                                {user.profilePic ? (
                                                    <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover"/>
                                                ) : (
                                                    <span className="text-white font-black text-xl tracking-widest">{getInitials(user.name)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-semibold text-gray-700 w-full text-center truncate group-hover:text-black">
                                            {user.name.split(" ")[0]}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MAIN DIRECTORY FEED (GRID) */}
                    <div className="mt-2 text-sm font-bold text-gray-900 mb-4 px-1">
                        {isSearching ? `Search Results (${filteredUsers.length})` : "Discover More"}
                    </div>

                    {isSearching && filteredUsers.length === 0 ? (
                        <div className="bg-white border text-center border-gray-200 rounded-2xl p-16 shadow-sm">
                            <span className="text-4xl block mb-4">🔍</span>
                            <h3 className="text-lg font-black text-gray-800">No hackers found</h3>
                            <p className="text-sm font-medium text-gray-500 mt-2">Try searching for a different name or college.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {(isSearching ? filteredUsers : users).map(user => (
                                <Link key={user._id} href={`/profile/${user._id}`} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex flex-col items-center text-center relative overflow-hidden">
                                    
                                    {/* Delicate Top Gradient Accent line */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="w-20 h-20 rounded-full bg-blue-50 border-4 border-white shadow-sm overflow-hidden flex items-center justify-center mb-3">
                                        {user.profilePic ? (
                                            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover"/>
                                        ) : (
                                            <span className="text-blue-600 font-black text-2xl tracking-widest">
                                                {getInitials(user.name)}
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-sm font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate w-full px-2">
                                        {user.name}
                                    </h2>

                                    <p className="text-[10px] font-bold text-gray-400 mb-4 truncate w-full px-2">
                                        {user.college || "Independent Hacker"}
                                    </p>

                                    <div className="mt-auto w-full flex items-center justify-between border-t border-gray-50 pt-3">
                                        <div className="flex flex-col items-start px-2">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Reputation</span>
                                            <span className="text-xs font-black text-blue-600">
                                                {user.reputationScore || 0}
                                            </span>
                                        </div>
                                        
                                        {/* Minimalist View Arrow */}
                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                            <span className="text-blue-600 group-hover:text-white text-xs font-bold leading-none transform translate-x-px">→</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {/* Global style to hide scrollbars for the Stories row */}
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}