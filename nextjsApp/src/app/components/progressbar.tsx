'use client'
import { Progress } from "@/src/components/ui/progress"
import { useEffect, useState } from "react";

export default function ProgressBar({resetkey} : { resetkey : string}) {
    const [value,setValue] = useState(0);
    useEffect(()=>{
        setValue(0);
    },[ resetkey])
    useEffect(()=>{
        if(value >= 100) return;
        const timer = setTimeout(()=>{
            setValue((prev)=>prev + 1)
        },70);
        return ()=>{
            if(timer) clearTimeout(timer); 
        }
    },[value])
    return <Progress value={value} className="transform scale-x-[-1]"/>
}