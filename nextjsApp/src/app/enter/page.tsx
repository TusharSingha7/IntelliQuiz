
'use client'
import {useEffect, useState} from 'react'
import CreateQuizPopup from '@/components/createQuiz';
import JoinQuizPopup from '@/components/joinQuiz';
import VantaBackground from '@/components/birdsBack';
import {v4 as uuidv4} from 'uuid'

export default function Enter() {
    const [showCreate , setCreate] = useState<boolean>(false);
    const [showJoin , setJoin] = useState<boolean>(false);
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
    return <>
    <VantaBackground value='GLOBE'>
    {showCreate && <CreateQuizPopup func={setCreate}/>}
    <div className="grid grid-cols-2 h-screen text-white">
        <div className="flex flex-col gap-4 min-h-screen justify-center">
                <button className="border w-56 mx-auto p-4 font-bold border">AI Generated Quiz</button>
                <button className="border w-56 mx-auto p-4 font-bold border" onClick={()=>{
                    setCreate(true);
                }}>Create AI Generated Multiplayer Quiz</button>
                <button className="border w-56 mx-auto p-4 font-bold border" onClick={()=>{
                    setJoin(true);
                }}>Join Multiplayer Quiz</button>
        </div>
        <div className="relative flex flex-col gap-4 min-h-full justify-center items-center">
            
        </div>
    </div>
    {showJoin && <JoinQuizPopup func={setJoin}/>}
    </VantaBackground>
    </>
    
}