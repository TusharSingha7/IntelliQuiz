'use client'

import { Dispatch, SetStateAction } from "react";
import {useState} from 'react'
import { useRouter } from "next/navigation";
import axios from "axios";

export default function JoinQuizPopup({func} : {
    func : Dispatch<SetStateAction<boolean>>
}) {
    const [username,setUsername] = useState<string>(localStorage.getItem('username') || "");
    const [roomid,setRoomid] = useState<string>("");
    const router = useRouter();

    return <>
    <div className="z-20 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 bg-gray-300 rounded shadow shadow-lg">
        <div className="flex flex-col items-center">
            <input placeholder="Username" defaultValue={localStorage.getItem('username') || ""} required={true} className="border w-56 border-black rounded font-bold p-2 my-2" onChange={(e)=>{setUsername(e.target.value)}}></input>
            <input placeholder="Room Id" required={true} className="border w-56 border-black rounded font-bold p-2 my-2" onChange={(e)=>{setRoomid(e.target.value)}}></input>
            <button className="border w-56 border-black font-bold h-10 my-2 rounded" onClick={async ()=>{
                //perfomr server side logic here
                localStorage.setItem('username' , username);
                localStorage.setItem("intelli-quiz-userId" , "abcd");
                if(username.length < 1) alert("invalid username");
                else {
                    const response = await axios.post('/api/v2',{
                        userId : localStorage.getItem("intelli-quiz-userId") || "efgh",
                        code : 2,
                        username : username,
                        topicDescription : "",
                        room_id : roomid,
                        questionsCount : 0
                    });
                    if(response && response.data.code) {
                        router.push(`/enter/${roomid}`)
                    }
                    else alert("please try again later")
                }
                
            }}>Join Quiz</button>
        </div>
    </div>
    <div onClick={()=>{
        func(false);
    }} className="z-10 opacity-50 h-full w-full fixed bg-gray-400 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        
    </div>
    </> 
    
}