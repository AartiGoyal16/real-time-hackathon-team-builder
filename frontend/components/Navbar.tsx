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
        <nav className="flex justify-between items-center px-6 md:px-20 py-4 bg-[#111827] border-b border-gray-800">
            <Link href="/" className="text-xl font-bold text-indigo-500">
                Real-Time Hackathon Team Builder
            </Link>

            <div className="space-x-6 text-gray-300">
                {isLoggedIn?(
                    <>
                        <Link href="/dashboard" className="hover:text-indigo-400">
                            Dashboard
                        </Link>
                        <button
                         onClick={handleLogout}
                         className="hover:text-red-400"
                        >
                            Logout
                        </button>
                    </>
                ):(
                    <>
                        <Link href="/login" className="hover:text-indigo-400">
                            Login
                        </Link>

                        <Link href="/register" className="hover:text-indigo-400">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}