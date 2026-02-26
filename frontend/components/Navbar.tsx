"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar(){
    const [isLoggedIn,setIsLoggedIn]=useState(false);

    useEffect(()=>{
        const token=localStorage.getItem("token");
        setIsLoggedIn(!!token);
    },[]);

    const handleLogout=()=>{
        localStorage.removeItem("token");
        window.location.reload();
    };

    return(
        <nav className="flex justify-between items-center px-8 md:px-16 py-6 border-b border-gray-300">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-4">
                <div className="flex flex-col text-sm font-bold leading-none border-r border-black pr-4">
                    <span>RH</span>
                    <span>TB</span>
                </div>

                <div className="flex flex-col text-xs font-semibold leading-tight tracking-wide">
                    <span>Real-Time Hackathon</span>
                    <span>Team Builder</span>
                </div>
            </Link>

            {/* Center Links */}
            <div className="hidden md:flex space-x-8 text-sm font-bold text-gray-800">
                <Link href="#" className="hover:text-blue-600">
                    About
                </Link>

                <Link href="#" className="hover:text-blue-600">
                    Features
                </Link>

                <Link href="#" className="hover:text-blue-600">
                    FAQ
                </Link>
            </div>

            {/* Right Action Button */}
            <div>
                {isLoggedIn ? (
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-sm font-bold hover:text-blue-600">
                            Dashboard
                        </Link>

                        <button onClick={handleLogout} className="bg-black text-white px-6 py-2 rounded font-bold text-sm hover:bg-gray-800 transition-colors">
                            Logout
                        </button>
                    </div>
                ):(
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold hover:text-blue-600">
                            Login
                        </Link>

                        <Link href="/register" className="bg-black text-white px-8 py-3 rounded font-bold text-sm hover:bg-gray-800 transition-colors">
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}