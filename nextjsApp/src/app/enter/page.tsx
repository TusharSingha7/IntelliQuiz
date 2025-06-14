
'use client'
import {useEffect, useState} from 'react'
import CreateQuizPopup from '@/components/createQuiz';
import JoinQuizPopup from '@/components/joinQuiz';
import VantaBackground from '@/components/birdsBack';
import {v4 as uuidv4} from 'uuid'
import LoadingUI from '@/components/loading';

export default function Enter() {
    const [showCreate , setCreate] = useState<boolean>(false);
    const [showJoin , setJoin] = useState<boolean>(false);
    const [loading,setLoading] = useState<boolean>(false);
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
    },[]);

    if(loading) return <LoadingCompo/>;

    return <>
    <VantaBackground value='GLOBE'>
    {showCreate && <CreateQuizPopup func={setCreate} loader={setLoading} />}
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


function LoadingCompo() {
    return <>
        <div role="status" className=" animate-pulse flex flex-col">
            <div className="flex">
            <div className="font-bold text-2xl p-2 grow-[6] pr-10 flex justify-end items-center">
                <span>Room Id : *******</span>
            </div>
            <div className=" grow-[4] pr-5 flex justify-end p-2">
                <button className="px-4 border border-black rounded py-2 font-bold shadow shadow-lg mr-2">Exit</button>
            </div>
        </div>
        <LoadingUI/>
        </div>
    </>
}