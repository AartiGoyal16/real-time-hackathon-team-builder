"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function Login(){
    const router=useRouter();

    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [loading,setLoading]=useState(false);
    const [error,setError]=useState("");

    const handleLogin=async()=>{
        try{
            setLoading(true);
            setError("");

            const res=await api.post("/auth/login",{
                email,
                password,
            });

            localStorage.setItem("user",JSON.stringify(res.data.user));

            router.push("/");
        }
        catch(err:any){
            const message=err.response?.data?.message || "Login failed"
            setError(message);
        }
        finally{
            setLoading(false);
        }
    };

    return(
        <div className="flex-1 flex flex-col items-center justify-center border-x border-gray-300 mx-8 md:mx-16 py-20 px-4">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        Welcome <span className="text-blue-600">Back</span>
                    </h1>

                    <p className="text-gray-600 font-medium">
                        Log in to manage your hackathon team.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-500 test-red-600 p-3 rounded mb-6 text-sm font-smeibold">
                        {error}
                        {error.toLowerCase().includes("not") && (
                            <div className="mt-2 font-normal text-red-500">
                                Don't have an account?{" "}
                                <Link href="/register" className="font-bold underline hover:text-red-700">
                                    Register here
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Form Container */}
                <div className="border border-gray-300 p-8">

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                            Email Address
                        </label>

                        <input type="email" placeholder="Enter your email..." className="w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                            Password
                        </label>

                        <input type="password" placeholder="Enter your password..." className="w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                    </div>

                    <button onClick={handleLogin} disabled={loading} className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors">
                        {loading? "Logging in...":"Login"}
                    </button>

                    {/* Register Link */}
                    <div className="mt-6 text-center text-sm font-semibold text-gray-600">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-blue-600 hover:text-blue-800 hover:underline">
                            Register here.
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}