
'use client'
import { useRouter } from "next/navigation";
import { useState} from "react";
import React from "react";

function DefaultCompo({room_id , flag , setter} : {room_id : string , flag : Boolean , setter : React.Dispatch<React.SetStateAction<Boolean>>}) {
    const router = useRouter();


    return <>
        <div className="flex">
            <div className="font-bold text-2xl p-2 grow-[6] pr-10 flex justify-end items-center">
                <span>Room Id : {room_id}</span>
            </div>
            <div className=" grow-[4] pr-5 flex justify-end p-2">
                <button className="px-4 border border-black rounded py-2 font-bold shadow shadow-lg mr-2" onClick={()=>{
                    //do server side logic here  
                    router.push('/enter')
                }}>Exit</button>
                {flag && <button className="px-4 border border-black rounded py-2 font-bold shadow shadow-lg" onClick={()=>{
                    //start the quiz 
                    setter(true);
                }}>
                    Start Quiz
                    </button>}
            </div>
        </div>
        <div className="h-[100vh] bg-red-400">
            <ul className="flex flex-col items-center bg-red-800 p-2 rounded h-full overflow-y-auto w-full">
                <li>HI there</li>
                <li>HI there</li>
                <li>HI there</li>
                <li>HI there</li>
            </ul>
        </div>
    </>
}

function MCQ() {
    return <>
        Hi This is an MCQ componeent which should be Imported indeally from other component
    </>
}

export default function RoomPage({params} : {
    params : Promise<{room_id : string}>
}) {
    const {room_id} = React.use(params);
    const [quizState,setQuizState] = useState<Boolean>(false);
    const [flag,setFlag] = useState<Boolean>(true);

    return <>
        {quizState ? <MCQ/> : <DefaultCompo room_id={room_id} flag={flag} setter={setQuizState} />}
    </>
}