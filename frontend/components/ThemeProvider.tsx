"use client";

import { useEffect, useContext, useState, createContext } from "react";

type Theme="light" | "dark";

interface ThemeContextType{
    theme: Theme;
    toggleTheme:()=>void;
}

const ThemeContext=createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({children}:{children:React.ReactNode}){
    const [theme,setTheme]=useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(()=>{
        setMounted(true);
        const storedTheme=localStorage.getItem("hackTheme") as Theme;

        if(storedTheme==="dark"){
            setTheme("dark");
            document.documentElement.classList.add("dark");
        }
    },[]);

    const toggleTheme=()=>{
        setTheme((prev)=>{
            const newTheme=prev==="light"?"dark":"light";
            localStorage.setItem("hackTheme",newTheme);
            if(newTheme==="dark"){
                document.documentElement.classList.add("dark");
            }
            else{
                document.documentElement.classList.remove("dark");
            }
            return newTheme;
        });
    };

    if(!mounted){
        return <div className="invisible">{children}</div>;
    }

    return(
        <ThemeContext.Provider value={{theme,toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(){
    const context=useContext(ThemeContext);
    if(!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
}