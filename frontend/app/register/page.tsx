"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function Register(){
    const router=useRouter();

    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [phone,setPhone]=useState("");
    const [password,setPassword]=useState("");

    const [loading,setLoading]=useState(false);
    const [error,setError]=useState("");

    const handleRegister=async()=>{
        try{
            setLoading(true);
            setError("");

            await api.post("/auth/register",{
                name,
                email,
                phone,
                password,
            });

            router.push("/login");
        }
        catch(err:any){
            const message=err.response?.data?.message || err.response?.data?.error || "Registration failed";
            setError(message);
        }
        finally{
            setLoading(false);
        }
    };

    return(
        <div className="flex-1 flex flex-col items-center justify-center border-x border-gray-300 mx-8 md:mx-16 py-12 px-4">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        Join the <span className="text-blue-600">Action</span>
                    </h1>

                    <p className="text-gray-600 font-medium">
                        Create an account to start building your hackathon team.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded mb-6 text-sm font-semibold">
                        {error}
                    </div>
                )}

                {/* Form Container */}
                <div className="border border-gray-300 p-8">
                    <div className="mb-5">
                        <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                            Full Name
                        </label>

                        <input type="text" placeholder="Your name..." className="w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" value={name} onChange={(e)=>setName(e.target.value)}/>
                        
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                            Email Address
                        </label>

                        <input type="email" placeholder="Enter your email..." className="w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                            Phone Number
                        </label>

                        <input type="tel" placeholder="Your Phone Number..." className="w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" value={phone} onChange={(e)=>setPhone(e.target.value)}/>
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                            Password
                        </label>

                        <input type="password" placeholder="Create a Password..." className="w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                    </div>

                    <button onClick={handleRegister} disabled={loading} className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors">
                        {loading? "Creating Account...":"Register"}
                    </button>

                    {/* Login Link */}
                    <div className="mt-6 text-center text-sm font-semibold text-gray-600">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
                            Log in here.
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}