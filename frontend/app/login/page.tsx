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

            const token=res.data.token;

            localStorage.setItem("token",token);

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
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
            <div className="w-full max-w-md bg-[#1e293b] p-8 rounded-2xl shadow-xl border border-gray-700">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">
                    Login
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm">
                        {error}
                        {error.toLowerCase().includes("not") && (
                            <div className="mt-2">
                                Don't have an account?{" "}
                                <Link
                                 href="/register"
                                 className="text-indigo-400 hover:underline"
                                >
                                    Register here
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                <input
                type="email"
                placeholder="Enter your email..."
                className="w-full p-3 mb-4 rounded-lg bg-[#0f127a] border border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                />

                <input
                type="password"
                placeholder="Enter your password..."
                className="w-full p-3 mb-6 rounded-lg bg-[#0f172a] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                />

                <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-indigo-600 py-3 rounded-lg hover:bg-indigo-500 transition disabled:opacity-50 font-semibold"
                >
                    {loading?"Logging in...":"Login"}
                </button>

                <p className="text-gray-400 text-sm mt-6 text-center">
                    Don't have an account?{" "}
                    <Link
                     href="/register"
                     className="text-indigo-400 hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}