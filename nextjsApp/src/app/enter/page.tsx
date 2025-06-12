
'use client'
import {useState} from 'react'
import CreateQuizPopup from '../components/createQuiz';
import JoinQuizPopup from '../components/joinQuiz';
import VantaBackground from '../components/birdsBack';

export default function Enter() {
    const [showCreate , setCreate] = useState<boolean>(false);
    const [showJoin , setJoin] = useState<boolean>(false);
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