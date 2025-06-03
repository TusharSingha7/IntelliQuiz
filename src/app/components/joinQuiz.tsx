'use client'

import { Dispatch, SetStateAction } from "react";
import {useState} from 'react'
import { useRouter } from "next/navigation";

export default function JoinQuizPopup({func} : {
    func : Dispatch<SetStateAction<boolean>>
}) {
    const [username,setUsername] = useState<string>("");
    const [roomid,setRoomid] = useState<string>("");
    const router = useRouter();

    return <>
    <div className="z-20 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 bg-gray-300 rounded shadow shadow-lg">
        <div className="flex flex-col items-center">
            <input placeholder="Username" required={true} className="border w-56 border-black rounded font-bold p-2 my-2" onChange={(e)=>{setUsername(e.target.value)}}></input>
            <input placeholder="Room Id" required={true} className="border w-56 border-black rounded font-bold p-2 my-2" onChange={(e)=>{setRoomid(e.target.value)}}></input>
            <button className="border w-56 border-black font-bold h-10 my-2 rounded" onClick={()=>{
                //perfomr server side logic here 
                const room_id = 'in123123';
                router.push(`/enter/${room_id}`)
            }}>Join Quiz</button>
        </div>
    </div>
    <div onClick={()=>{
        func(false);
    }} className="z-10 opacity-50 h-full w-full fixed bg-gray-400 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        
    </div>
    </> 
    
}