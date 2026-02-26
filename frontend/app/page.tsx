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
    <div className="flex flex-col flex-1 border-x border-gray-300 mx-8 md:mx-16">

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 py-20 px-4 text center">

        {/* Date/Status Badges (Optional layout elements from the design) */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 border border-gray-400 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-600 tracking-wide uppercase">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Real-Time Matching
          </div>

          <div className="flex items-center gap-2 border border-gray-400 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-600 tracking-wide uppercase">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2V2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              100% Free
          </div>
        </div>

        {/* Main Title & Subtitle */}
      </section>


    </div>
  );
}