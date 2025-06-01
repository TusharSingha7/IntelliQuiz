
'use client'
import {useState} from 'react'
import CreateQuizPopup from '../components/createQuiz';
import JoinQuizPopup from '../components/joinQuiz';
import Image from 'next/image';
import img from '@/public/Graident Ai Robot.jpg'

export default function Enter() {
    const [showCreate , setCreate] = useState<boolean>(false);
    const [showJoin , setJoin] = useState<boolean>(false);
    return <>
    {showCreate && <CreateQuizPopup func={setCreate}/>}
    <div className="grid grid-cols-2 h-full">
        <div className="flex flex-col gap-4 min-h-full justify-center">
                <button className="border w-56 mx-auto p-4 font-bold border-black">Create Quiz</button>
                <button className="border w-56 mx-auto p-4 font-bold border-black" onClick={()=>{
                    setCreate(true);
                }}>Create Multiplayer Quiz</button>
                <button className="border w-56 mx-auto p-4 font-bold border-black" onClick={()=>{
                    setJoin(true);
                }}>Join Multiplayer Quiz</button>
        </div>
        <div className="relative flex flex-col gap-4 min-h-full justify-center items-center">
            <Image
                src={img}
                placeholder='blur'
                alt=''
                height={500}
            >
            </Image> 
        </div>
    </div>
    {showJoin && <JoinQuizPopup func={setJoin}/>}
    </>
    
}