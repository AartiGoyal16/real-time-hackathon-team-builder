"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard(){
    const router=useRouter();

    useEffect(()=>{
        const token=localStorage.getItem("token");

        if(!token){
            router.push("/login");
        }
    },[]);

    return(
        <div>
            <h1 className="text-3xl font-bold">
                Welcome to Dashboard
            </h1>
        </div>
    )
}