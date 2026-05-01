"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError("");
            setMessage("");

            const res = await api.post("/auth/forgot-password", { email });
            setMessage(res.data.message || "Email sent successfully! Check your inbox.");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center border-x border-gray-300 mx-8 md:mx-16 py-20 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        Reset <span className="text-blue-600">Password</span>
                    </h1>
                    <p className="text-gray-600 font-medium">
                        Enter your email to receive a password reset link.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded mb-6 text-sm font-semibold">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-50 border border-green-500 text-green-700 p-3 rounded mb-6 text-sm font-semibold">
                        {message}
                    </div>
                )}

                <div className="border border-gray-300 p-8">
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                            Email Address
                        </label>
                        <input type="email" placeholder="Enter your email..." className="w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <button onClick={handleSubmit} disabled={loading} className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors">
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                    <div className="mt-6 text-center text-sm font-semibold text-gray-600">
                        Remembered your password?{" "}
                        <Link href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
                            Log in here.
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
