"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home(){
  const [isLoggedIn,setIsLoggedIn]=useState(false);

  useEffect(()=>{
    const token=localStorage.getItem("token");
    setIsLoggedIn(!!token);
  },[]);

  return(
    <div className="text-center mt-20">
      <h1 className="text-5xl font-bold text-indigo-500 mb-6">
        Build Your Hackathon Team
      </h1>

      <p className="text-gray-400 mb-8">
        Real-time team building platform
      </p>

      {isLoggedIn?(
        <Link
         href="/dashboard"
         className="bg-indigo-600 px-6 py-3 rounded-lg hover-bg-indigo-500"
        >
          Go to Dashboard
        </Link>
      ):(
        <Link
         href="/login"
          className="bg-indigo-600 px-6 py-3 rounded-lg hover:big-indigo-500"
        >
          Get Started
        </Link>
      )}
    </div>
  );
}