"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ResetPassword() {
    const params = useParams();
    const router = useRouter();
    const token = params?.token as string;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");

            const res = await api.put(`/auth/reset-password/${token}`, { password });
            setMessage("Password updated successfully! Redirecting to login...");
            
            setTimeout(() => {
                router.push("/login");
            }, 2000);
            
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center border-x border-gray-300 mx-8 md:mx-16 py-20 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        New <span className="text-blue-600">Password</span>
                    </h1>
                    <p className="text-gray-600 font-medium">
                        Enter a strong password to secure your account.
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
                            New Password
                        </label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} placeholder="Min 8 chars, 1 uppercase, 1 symbol..." className="w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors pr-16" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-xs font-bold text-gray-500 hover:text-black">
                                {showPassword ? "HIDE" : "SHOW"}
                            </button>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password..." className="w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors pr-16" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3 text-xs font-bold text-gray-500 hover:text-black">
                                {showConfirmPassword ? "HIDE" : "SHOW"}
                            </button>
                        </div>
                    </div>

                    <button onClick={handleSubmit} disabled={loading || !!message} className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors">
                        {loading ? "Updating..." : "Reset Password"}
                    </button>
                </div>
            </div>
        </div>
    );
}
