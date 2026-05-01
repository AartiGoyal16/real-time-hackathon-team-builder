"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import io, { Socket } from "socket.io-client";

export default function Navbar(){
    const [isLoggedIn,setIsLoggedIn]=useState(false);
    const [currentUser,setCurrentUser]=useState<any>(null);
    const router=useRouter();
    const [globalNotification,setGlobalNotification]=useState<{sender: string,text: string} |null>(null);
    const [unreadCount,setUnreadCount]=useState(0);
    const socketRef=useRef<Socket | null>(null);
    const [isMobileMenuOpen,setIsMobileOpen]=useState(false);
    const pathname = usePathname();

    const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/register") || pathname?.startsWith("/forgot-password") || pathname?.startsWith("/reset-password");

    if (isAuthRoute) return null;

    useEffect(()=>{
        const userStr=localStorage.getItem("user");
        if(userStr){
            setIsLoggedIn(true);
            setCurrentUser(JSON.parse(userStr));
        }
    },[]);

    useEffect(()=>{
        if(!currentUser) return;

        socketRef.current=io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",{
            withCredentials:true
        });

        const socket=socketRef.current;

        socket.on("connect",()=>{
            socket.emit("registerUser",currentUser.id);
        });

        socket.on("receiveDirectMessage",(msg:any)=>{
            if(msg.sender !== currentUser.id && !window.location.pathname.includes(msg.sender)){
                setGlobalNotification({
                    sender: "New Message!",
                    text: msg.text.length>30 ? msg.text.substring(0,30)+"...":msg.text
                });

                setUnreadCount(prev=>prev+1);

                setTimeout(()=>{
                    setGlobalNotification(null);
                },4000);
            }
        });

        return ()=>{socket.disconnect();};
    },[currentUser]);
    
    const handleLogout= async()=>{
        try{
            await api.post("/auth/logout");
        }
        catch(err){
            console.error("Logout API failed");
        }
        finally{
            localStorage.removeItem("user");
            setIsLoggedIn(false);
            // router.push("/login");
            window.location.href="/login";
        }
    };

    return(
        <nav className="flex justify-between items-center px-8 md:px-16 py-6 border-b border-gray-300 relative z-50 bg-white w-full">

            {/* Notification */}
            {globalNotification && (
                <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 z-[100] border border-gray-700 w-[90%] md:w-80">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black animate-pulse shrink-0">
                        💬
                    </div>

                    <div>
                        <h4 className="font-bold text-sm text-blue-400 uppercase tracking-widest">
                            {globalNotification.sender}
                        </h4>

                        <p className="text-sm font-semibold mt-1 text-gray-200">
                            {globalNotification.text}
                        </p>
                    </div>
                </div>
            )}

            {isMobileMenuOpen&& (
                <div className="fixed inset-0 z-30" onClick={()=>setIsMobileOpen(false)}/>
            )}

            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-4 z-50">
                <div className="flex flex-col text-sm font-bold leading-none border-r border-black pr-4">
                    <span>RH</span>
                    <span>TB</span>
                </div>

                <div className="flex flex-col text-xs font-semibold leading-tight tracking-wide">
                    <span>Real-Time Hackathon</span>
                    <span>Team Builder</span>
                </div>
            </Link>

            {/* Center Links
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
            </div> */}

            {/* Right Action Button */}
            <div className="hidden md:flex items-center gap-6">
                {isLoggedIn ? (
                    <>
                        {/* Explore Hackers */}
                        <Link href="/users" className="text-sm font-bold hover:text-blue-600 transition">
                            Explore Hackers
                        </Link>

                        {/* {message link} */}
                        <Link href="/messages" onClick={()=>setUnreadCount(0)} className="text-sm font-bold flex items-center gap-2 hover:text-blue-600 transition">
                            Messages

                            {unreadCount>0 && (
                                <span className="flex items-center justify-center w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full shadow-sm animate-bounce">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>

                        <Link href="/dashboard" className="text-sm font-bold hover:text-blue-600 border-l border-gray-300 pl-6">
                            Dashboard
                        </Link>

                        <Link href="/profile" className="text-sm font-bold hover:text-blue-600 border-l border-gray-300 pl-6">
                            My Profile
                        </Link>

                        <Link href="/settings" className="text-sm font-bold hover:text-blue-600 border-l border-gray-300 pl-6">
                            Settings
                        </Link>

                        <button onClick={handleLogout} className="bg-black text-white px-6 py-2 rounded font-bold text-sm hover:bg-gray-800 transition-colors ml-4 shadow-sm">
                            Logout
                        </button>
                    </>

                ):(
                    <>
                        <Link href="/login" className="text-sm font-bold hover:text-blue-600">
                            Login
                        </Link>

                        <Link href="/register" className="bg-black text-white px-8 py-3 rounded font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm">
                            Get Started
                        </Link>
                    </>
                )}
            </div>

            <button className="md:hidden flex flex-col gap-1.5 z-50 p-2 relative" onClick={()=>setIsMobileOpen(!isMobileMenuOpen)}>

                {unreadCount > 0 && !isMobileMenuOpen && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full shadow-md animate-bounce">
                        {unreadCount}
                    </span>
                )}
                <div className={`w-6 h-0.5 bg-black transition-all ${isMobileMenuOpen? "rotate-45 translate-y-2":""}`}></div>

                <div className={`w-6 h-0.5 bg-black transition-all ${isMobileMenuOpen? "opacity-0":""}`}></div>

                <div className={`w-6 h-0.5 bg-black transition-all ${isMobileMenuOpen? "-rotate-45 -translate-y-2":""}`}></div>
            </button>

            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white border-b border-gray-300 shadow-lg md:hidden flex flex-col items-center py-6 gap-6 z-40">
                    {isLoggedIn?(
                        <>
                            <Link href="/users" onClick={()=>setIsMobileOpen(false)} className="text-sm font-bold hover:text-blue-600 w-full text-center">
                                Explore Hackers
                            </Link>

                            <Link href="/messages" onClick={()=>{setIsMobileOpen(false); setUnreadCount(0); }} className="text-sm font-bold flex justify-center items-center gap-2 hover:text-blue-600 w-full text-center">
                                Messages 

                                {unreadCount>0 && (
                                    <span className="flex items-center justify-center w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full shadow-md">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>

                            <Link href="/dashboard" onClick={()=>setIsMobileOpen(false)} className="text-sm font-bold hover:text-blue-600 w-full text-center">
                                Dashboard
                            </Link>

                            <Link href="/profile" onClick={()=>setIsMobileOpen(false)} className="text-sm font-bold hover:text-blue-600 w-full text-center">
                                My Profile
                            </Link>

                            <Link href="/settings" className="font-bold text-sm tracking-wider hover:text-blue-600 transition truncate">
                                Settings
                            </Link>

                            <button onClick={handleLogout} className="bg-black text-white px-12 py-3 rounded font-bold text-sm hover:bg-gray-800 mt-2">
                                Logout
                            </button>
                        </>
                    ):(
                        <>
                            <Link href="/login" onClick={()=> setIsMobileOpen(false)} className="text-sm font-bold hover:text-blue-600 w-full tetx-center">
                                Login
                            </Link>

                            <Link href="/register" onClick={()=>setIsMobileOpen(false)} className="bg-black text-white px-12 py-3 rounded font-bold text-sm hover:bg-gray-800">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}