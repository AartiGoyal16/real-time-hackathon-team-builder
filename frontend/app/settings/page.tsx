"use client";

import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";

export default function SettingsPage(){
    const {theme,toggleTheme}=useTheme();

    return(
        <div className="flex-1 border-x border-gray-300 mx-8 md:mx-16 py-12 px-6">
            <h1 className="text-4xl font-black tracking-tight mb-2">
                Account 
                <span className="text-blue-600">
                    Settings
                </span>
            </h1>

            <p className="text-gray-600 font-medium mb-12">
                Manage your preferences and application appearance.
            </p>

            <div className="max-w-2xl border border-gray-300 bg-white shadow-sm p-8">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-200 pb-2">
                    Appearance
                </h2>

                <div className="flex items-center justify-between py-4">
                    <div>
                        <h3 className="text-lg font-black text-black mb-1">
                            Theme Toggle
                        </h3>

                        <p className="text-sm font-semibold text-gray-500">
                            Switch between light and dark mode for late-night hacking.
                        </p>
                    </div>

                    <button onClick={toggleTheme} className={`relative w-24 h-12 rounded-full border-4 transition-colors flex items-center pr-1 pl-1 ${theme==="dark"? "bg-black border-blue-600":"bg-gray-200 border-gray-300"}`}>
                        <div className={`w-8 h-8 rounded-full bg-white shadow-md transform transition-transform flex items-center justify-center ${theme==="dark"? "translate-x-12":"translate-x-0"}`}>
                            <span className="text-sm pointer-events-none no-invert">
                                {theme==="dark"?"🌙":"☀️"}
                            </span>
                        </div>
                    </button>
                </div>

                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-12 mb-6 border-b border-gray-200 pb-2">
                    Account Zones
                </h2>

                <div className="bg-red-50 border border-red-200 p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-red-700 mb-1">
                            Danger Zone
                        </h3>

                        <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                            Cannot be undone
                        </p>
                    </div>

                    <button className="bg-red-600 text-white px-6 py-3 font-bold text-sm uppercase tracking-widest hover:bg-black transition-colors shadow-sm">
                        Deactivate
                    </button>
                </div>
            </div>
        </div>
    );
}