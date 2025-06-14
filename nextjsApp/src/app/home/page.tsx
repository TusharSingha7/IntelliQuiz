'use client'
import VantaBackground from "@/components/birdsBack"
import { useEffect } from "react"
import {v4 as uuidv4} from 'uuid'
export default function HomePage() {

    useEffect(()=>{

        try {
            if(!localStorage.getItem("intelli-quiz-userId")) {
                const id = crypto.randomUUID();
                localStorage.setItem("intelli-quiz-userId" , id);
            }
        }catch(err) {
            const id = uuidv4();
            localStorage.setItem("intelli-quiz-userId" , id);
        }
        

    },[])

    return ( <VantaBackground>
        <div className="min-h-full">
            HI there from home page
        </div>
    </VantaBackground>
    )
}